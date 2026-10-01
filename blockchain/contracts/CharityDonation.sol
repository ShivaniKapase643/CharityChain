// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CharityDonation
 * @dev Transparent charity donation system on Ethereum.
 *      - Admin (owner) manages charity verification on-chain.
 *      - Donors can only donate to verified charities.
 *      - All donations are publicly recorded with events.
 *
 * SECURITY:
 *  - ReentrancyGuard prevents reentrancy attacks on donate().
 *  - Ownable restricts admin functions.
 *  - Zero-value donations are rejected.
 *  - Only verified charities can receive donations.
 *  - Wallet addresses validated against zero-address.
 */
contract CharityDonation is ReentrancyGuard, Ownable {

    // ─────────────────────────────────────────────
    // ENUMS & STRUCTS
    // ─────────────────────────────────────────────

    enum CharityStatus { Pending, Verified, Rejected }

    struct Charity {
        address walletAddress;   // Charity's Ethereum wallet
        string  name;            // Charity name (kept minimal on-chain)
        CharityStatus status;    // Verification status
        uint256 totalReceived;   // Cumulative donations in wei
        uint256 donorCount;      // Unique donor tracking (approximation)
        bool    exists;          // Existence flag
    }

    struct Donation {
        address donor;           // Donor wallet address
        address charity;         // Charity wallet address
        uint256 amount;          // Amount donated in wei
        uint256 timestamp;       // Block timestamp
    }

    // ─────────────────────────────────────────────
    // STATE VARIABLES
    // ─────────────────────────────────────────────

    // Charity wallet address => Charity struct
    mapping(address => Charity) public charities;

    // All charity wallet addresses (for enumeration)
    address[] public charityAddresses;

    // All donations (donation ID => Donation struct)
    Donation[] public donations;

    // Donor address => list of donation IDs
    mapping(address => uint256[]) public donorDonations;

    // Charity address => list of donation IDs
    mapping(address => uint256[]) public charityDonations;

    // ─────────────────────────────────────────────
    // EVENTS
    // ─────────────────────────────────────────────

    event CharityRegistered(
        address indexed charityWallet,
        string  name,
        uint256 timestamp
    );

    event CharityVerified(
        address indexed charityWallet,
        uint256 timestamp
    );

    event CharityRejected(
        address indexed charityWallet,
        uint256 timestamp
    );

    event DonationReceived(
        address indexed donor,
        address indexed charity,
        uint256 amount,
        uint256 donationId,
        uint256 timestamp
    );

    // ─────────────────────────────────────────────
    // CONSTRUCTOR
    // ─────────────────────────────────────────────

    /**
     * @dev Sets the deployer as the owner (admin).
     *      The owner address represents the platform admin.
     */
    constructor() Ownable(msg.sender) {}

    // ─────────────────────────────────────────────
    // ADMIN FUNCTIONS
    // ─────────────────────────────────────────────

    /**
     * @dev Register a charity on-chain. Only owner (admin) can register.
     * @param _walletAddress Charity's receiving wallet address.
     * @param _name          Short name stored on-chain for reference.
     */
    function registerCharity(
        address _walletAddress,
        string calldata _name
    ) external onlyOwner {
        require(_walletAddress != address(0), "Invalid address");
        require(!charities[_walletAddress].exists, "Already registered");
        require(bytes(_name).length > 0, "Name required");

        charities[_walletAddress] = Charity({
            walletAddress: _walletAddress,
            name: _name,
            status: CharityStatus.Pending,
            totalReceived: 0,
            donorCount: 0,
            exists: true
        });

        charityAddresses.push(_walletAddress);

        emit CharityRegistered(_walletAddress, _name, block.timestamp);
    }

    /**
     * @dev Verify (approve) a registered charity. Only owner.
     * @param _charityWallet Charity wallet address to verify.
     */
    function verifyCharity(address _charityWallet) external onlyOwner {
        require(charities[_charityWallet].exists, "Charity not found");
        require(
            charities[_charityWallet].status != CharityStatus.Verified,
            "Already verified"
        );

        charities[_charityWallet].status = CharityStatus.Verified;

        emit CharityVerified(_charityWallet, block.timestamp);
    }

    /**
     * @dev Reject a charity. Only owner.
     * @param _charityWallet Charity wallet address to reject.
     */
    function rejectCharity(address _charityWallet) external onlyOwner {
        require(charities[_charityWallet].exists, "Charity not found");
        require(
            charities[_charityWallet].status != CharityStatus.Rejected,
            "Already rejected"
        );

        charities[_charityWallet].status = CharityStatus.Rejected;

        emit CharityRejected(_charityWallet, block.timestamp);
    }

    // ─────────────────────────────────────────────
    // DONATION FUNCTION
    // ─────────────────────────────────────────────

    /**
     * @dev Donate ETH to a verified charity.
     *      - Charity must be verified by admin.
     *      - Donation must be > 0.
     *      - Protected against reentrancy.
     * @param _charityWallet Target charity wallet address.
     */
    function donate(address payable _charityWallet) external payable nonReentrant {
        require(_charityWallet != address(0), "Invalid charity address");
        require(charities[_charityWallet].exists, "Charity not registered");
        require(
            charities[_charityWallet].status == CharityStatus.Verified,
            "Charity not verified"
        );
        require(msg.value > 0, "Donation must be greater than zero");
        require(msg.sender != _charityWallet, "Cannot donate to yourself");

        // Record the donation
        uint256 donationId = donations.length;
        donations.push(Donation({
            donor: msg.sender,
            charity: _charityWallet,
            amount: msg.value,
            timestamp: block.timestamp
        }));

        // Update charity totals
        charities[_charityWallet].totalReceived += msg.value;
        charities[_charityWallet].donorCount += 1;

        // Index for lookups
        donorDonations[msg.sender].push(donationId);
        charityDonations[_charityWallet].push(donationId);

        // Transfer funds directly to charity wallet
        // Using call() instead of transfer() for security (EIP-1884)
        (bool success, ) = _charityWallet.call{value: msg.value}("");
        require(success, "Transfer failed");

        emit DonationReceived(
            msg.sender,
            _charityWallet,
            msg.value,
            donationId,
            block.timestamp
        );
    }

    // ─────────────────────────────────────────────
    // VIEW / QUERY FUNCTIONS
    // ─────────────────────────────────────────────

    /**
     * @dev Get charity details by wallet address.
     */
    function getCharity(address _walletAddress)
        external
        view
        returns (
            address walletAddress,
            string memory name,
            CharityStatus status,
            uint256 totalReceived,
            uint256 donorCount
        )
    {
        require(charities[_walletAddress].exists, "Charity not found");
        Charity storage c = charities[_walletAddress];
        return (c.walletAddress, c.name, c.status, c.totalReceived, c.donorCount);
    }

    /**
     * @dev Check if a charity is verified.
     */
    function isCharityVerified(address _walletAddress) external view returns (bool) {
        return charities[_walletAddress].exists &&
               charities[_walletAddress].status == CharityStatus.Verified;
    }

    /**
     * @dev Get all donation IDs made by a specific donor.
     */
    function getDonorDonations(address _donor)
        external
        view
        returns (uint256[] memory)
    {
        return donorDonations[_donor];
    }

    /**
     * @dev Get all donation IDs received by a specific charity.
     */
    function getCharityDonations(address _charity)
        external
        view
        returns (uint256[] memory)
    {
        return charityDonations[_charity];
    }

    /**
     * @dev Get donation details by ID.
     */
    function getDonation(uint256 _donationId)
        external
        view
        returns (
            address donor,
            address charity,
            uint256 amount,
            uint256 timestamp
        )
    {
        require(_donationId < donations.length, "Invalid donation ID");
        Donation storage d = donations[_donationId];
        return (d.donor, d.charity, d.amount, d.timestamp);
    }

    /**
     * @dev Get total number of donations on-chain.
     */
    function getTotalDonations() external view returns (uint256) {
        return donations.length;
    }

    /**
     * @dev Get all registered charity addresses.
     */
    function getAllCharities() external view returns (address[] memory) {
        return charityAddresses;
    }

    /**
     * @dev Get total number of registered charities.
     */
    function getTotalCharities() external view returns (uint256) {
        return charityAddresses.length;
    }
}
