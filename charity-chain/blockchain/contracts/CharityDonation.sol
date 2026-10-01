// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title CharityDonation
 * @author CharityChain
 * @notice Records transparent donation transactions on-chain.
 *
 * DESIGN NOTES (on-chain vs off-chain):
 *  ON-CHAIN  : charity wallet address, donor wallet address, amount, timestamp,
 *              verification status, donation counter.
 *  OFF-CHAIN : charity name, description, documents, user profile data → MongoDB.
 *
 * SECURITY:
 *  - Only the contract owner (admin) can verify/unregister charities.
 *  - ReentrancyGuard prevents re-entrancy on the donate() function.
 *  - Zero-value donations are rejected.
 *  - Donations to unverified/non-existent charities are rejected.
 *  - Input addresses validated (non-zero).
 */

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CharityDonation is ReentrancyGuard, Ownable {
    // ─── Data Structures ──────────────────────────────────────────────────────

    enum CharityStatus { NotRegistered, Pending, Verified, Rejected }

    struct Charity {
        address walletAddress;
        CharityStatus status;
        uint256 totalReceived;   // total ETH received in wei
        uint256 donationCount;
        bool exists;
    }

    struct Donation {
        address donor;
        address charity;
        uint256 amount;          // in wei
        uint256 timestamp;
    }

    // ─── State Variables ──────────────────────────────────────────────────────

    // charityWallet → Charity
    mapping(address => Charity) public charities;

    // All donation records (append-only)
    Donation[] public donations;

    // donor → list of donation indices
    mapping(address => uint256[]) private donorDonationIndices;

    // charity → list of donation indices
    mapping(address => uint256[]) private charityDonationIndices;

    // ─── Events ───────────────────────────────────────────────────────────────

    event CharityRegistered(address indexed charityWallet, uint256 timestamp);
    event CharityVerified(address indexed charityWallet, uint256 timestamp);
    event CharityRejected(address indexed charityWallet, uint256 timestamp);

    event DonationReceived(
        address indexed donor,
        address indexed charity,
        uint256 amount,
        uint256 timestamp,
        uint256 donationIndex
    );

    // ─── Constructor ──────────────────────────────────────────────────────────

    /// @param initialOwner  The deployer address that becomes the admin/owner
    constructor(address initialOwner) Ownable(initialOwner) {}

    // ─── Charity Management (owner only) ─────────────────────────────────────

    /**
     * @notice Register a new charity wallet (called after off-chain approval).
     * @dev    Status is set to Pending; admin must call verifyCharity() to activate.
     */
    function registerCharity(address _charityWallet) external onlyOwner {
        require(_charityWallet != address(0), "Invalid charity address");
        require(!charities[_charityWallet].exists, "Charity already registered");

        charities[_charityWallet] = Charity({
            walletAddress: _charityWallet,
            status: CharityStatus.Pending,
            totalReceived: 0,
            donationCount: 0,
            exists: true
        });

        emit CharityRegistered(_charityWallet, block.timestamp);
    }

    /**
     * @notice Mark a registered charity as Verified so it can receive donations.
     */
    function verifyCharity(address _charityWallet) external onlyOwner {
        require(charities[_charityWallet].exists, "Charity not registered");
        require(
            charities[_charityWallet].status != CharityStatus.Verified,
            "Already verified"
        );

        charities[_charityWallet].status = CharityStatus.Verified;

        emit CharityVerified(_charityWallet, block.timestamp);
    }

    /**
     * @notice Reject a charity application — it can no longer receive donations.
     */
    function rejectCharity(address _charityWallet) external onlyOwner {
        require(charities[_charityWallet].exists, "Charity not registered");

        charities[_charityWallet].status = CharityStatus.Rejected;

        emit CharityRejected(_charityWallet, block.timestamp);
    }

    // ─── Donation ─────────────────────────────────────────────────────────────

    /**
     * @notice Donate ETH to a verified charity.
     * @dev    nonReentrant prevents re-entrancy attacks.
     *         ETH is transferred directly to the charity wallet.
     */
    function donate(address _charityWallet) external payable nonReentrant {
        require(_charityWallet != address(0), "Invalid charity address");
        require(msg.value > 0, "Donation amount must be greater than zero");
        require(charities[_charityWallet].exists, "Charity not registered");
        require(
            charities[_charityWallet].status == CharityStatus.Verified,
            "Charity is not verified"
        );

        // Record donation
        uint256 donationIndex = donations.length;
        donations.push(
            Donation({
                donor: msg.sender,
                charity: _charityWallet,
                amount: msg.value,
                timestamp: block.timestamp
            })
        );

        // Update indices
        donorDonationIndices[msg.sender].push(donationIndex);
        charityDonationIndices[_charityWallet].push(donationIndex);

        // Update charity stats
        charities[_charityWallet].totalReceived += msg.value;
        charities[_charityWallet].donationCount += 1;

        // Transfer ETH to charity wallet
        (bool success, ) = payable(_charityWallet).call{value: msg.value}("");
        require(success, "Transfer to charity failed");

        emit DonationReceived(
            msg.sender,
            _charityWallet,
            msg.value,
            block.timestamp,
            donationIndex
        );
    }

    // ─── View Functions ───────────────────────────────────────────────────────

    /**
     * @notice Get charity details by wallet address.
     */
    function getCharity(address _charityWallet)
        external
        view
        returns (
            address walletAddress,
            uint8 status,
            uint256 totalReceived,
            uint256 donationCount
        )
    {
        require(charities[_charityWallet].exists, "Charity not registered");
        Charity memory c = charities[_charityWallet];
        return (c.walletAddress, uint8(c.status), c.totalReceived, c.donationCount);
    }

    /**
     * @notice Check if a charity is currently verified.
     */
    function isVerified(address _charityWallet) external view returns (bool) {
        return charities[_charityWallet].status == CharityStatus.Verified;
    }

    /**
     * @notice Total number of donations recorded on-chain.
     */
    function totalDonations() external view returns (uint256) {
        return donations.length;
    }

    /**
     * @notice Get donation indices made by a specific donor.
     */
    function getDonorDonationIndices(address _donor)
        external
        view
        returns (uint256[] memory)
    {
        return donorDonationIndices[_donor];
    }

    /**
     * @notice Get donation indices received by a specific charity.
     */
    function getCharityDonationIndices(address _charityWallet)
        external
        view
        returns (uint256[] memory)
    {
        return charityDonationIndices[_charityWallet];
    }

    /**
     * @notice Retrieve a single donation record by its index.
     */
    function getDonation(uint256 _index)
        external
        view
        returns (
            address donor,
            address charity,
            uint256 amount,
            uint256 timestamp
        )
    {
        require(_index < donations.length, "Invalid donation index");
        Donation memory d = donations[_index];
        return (d.donor, d.charity, d.amount, d.timestamp);
    }
}
