/**
 * CharityDonation.test.js
 * Full test suite for the CharityDonation smart contract.
 * Run: npx hardhat test
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CharityDonation", function () {
  let contract;
  let owner;       // admin / deployer
  let charity1;    // verified charity wallet
  let charity2;    // another charity
  let donor1;
  let donor2;
  let nonOwner;

  // Helper: parse ETH string to BigInt (wei)
  const toWei = (amount) => ethers.parseEther(amount);

  beforeEach(async function () {
    [owner, charity1, charity2, donor1, donor2, nonOwner] =
      await ethers.getSigners();

    const CharityDonation =
      await ethers.getContractFactory("CharityDonation");
    contract = await CharityDonation.deploy(owner.address);
    await contract.waitForDeployment();
  });

  // ─── 1. Charity Registration ──────────────────────────────────────────────

  describe("Charity Registration", function () {
    it("should allow owner to register a charity", async function () {
      await expect(contract.registerCharity(charity1.address))
        .to.emit(contract, "CharityRegistered")
        .withArgs(charity1.address, await getTimestamp());

      const info = await contract.getCharity(charity1.address);
      expect(info.status).to.equal(1); // Pending = 1
    });

    it("should reject registration of zero address", async function () {
      await expect(
        contract.registerCharity(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid charity address");
    });

    it("should reject duplicate registration", async function () {
      await contract.registerCharity(charity1.address);
      await expect(
        contract.registerCharity(charity1.address)
      ).to.be.revertedWith("Charity already registered");
    });

    it("should reject registration from non-owner", async function () {
      await expect(
        contract.connect(nonOwner).registerCharity(charity1.address)
      ).to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
    });
  });

  // ─── 2. Charity Verification ──────────────────────────────────────────────

  describe("Charity Verification", function () {
    beforeEach(async function () {
      await contract.registerCharity(charity1.address);
    });

    it("should allow owner to verify a registered charity", async function () {
      await expect(contract.verifyCharity(charity1.address))
        .to.emit(contract, "CharityVerified")
        .withArgs(charity1.address, await getTimestamp());

      expect(await contract.isVerified(charity1.address)).to.equal(true);
    });

    it("should reject verification of unregistered charity", async function () {
      await expect(
        contract.verifyCharity(charity2.address)
      ).to.be.revertedWith("Charity not registered");
    });

    it("should reject double verification", async function () {
      await contract.verifyCharity(charity1.address);
      await expect(
        contract.verifyCharity(charity1.address)
      ).to.be.revertedWith("Already verified");
    });

    it("should reject verification from non-owner", async function () {
      await expect(
        contract.connect(nonOwner).verifyCharity(charity1.address)
      ).to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
    });
  });

  // ─── 3. Charity Rejection ─────────────────────────────────────────────────

  describe("Charity Rejection", function () {
    beforeEach(async function () {
      await contract.registerCharity(charity1.address);
    });

    it("should allow owner to reject a charity", async function () {
      await expect(contract.rejectCharity(charity1.address))
        .to.emit(contract, "CharityRejected")
        .withArgs(charity1.address, await getTimestamp());

      const info = await contract.getCharity(charity1.address);
      expect(info.status).to.equal(3); // Rejected = 3
    });

    it("should reject rejection of unregistered charity", async function () {
      await expect(
        contract.rejectCharity(charity2.address)
      ).to.be.revertedWith("Charity not registered");
    });
  });

  // ─── 4. Donation to Verified Charity ─────────────────────────────────────

  describe("Donation to Verified Charity", function () {
    beforeEach(async function () {
      await contract.registerCharity(charity1.address);
      await contract.verifyCharity(charity1.address);
    });

    it("should accept a valid donation and emit event", async function () {
      const amount = toWei("0.1");
      await expect(
        contract.connect(donor1).donate(charity1.address, { value: amount })
      )
        .to.emit(contract, "DonationReceived")
        .withArgs(donor1.address, charity1.address, amount, await getTimestamp(), 0);
    });

    it("should transfer ETH to the charity wallet", async function () {
      const amount = toWei("0.5");
      const balanceBefore = await ethers.provider.getBalance(charity1.address);
      await contract.connect(donor1).donate(charity1.address, { value: amount });
      const balanceAfter = await ethers.provider.getBalance(charity1.address);
      expect(balanceAfter - balanceBefore).to.equal(amount);
    });

    it("should update charity donation stats", async function () {
      await contract.connect(donor1).donate(charity1.address, { value: toWei("0.1") });
      await contract.connect(donor2).donate(charity1.address, { value: toWei("0.2") });

      const info = await contract.getCharity(charity1.address);
      expect(info.totalReceived).to.equal(toWei("0.3"));
      expect(info.donationCount).to.equal(2n);
    });

    it("should record donation correctly", async function () {
      const amount = toWei("0.1");
      await contract.connect(donor1).donate(charity1.address, { value: amount });

      const d = await contract.getDonation(0);
      expect(d.donor).to.equal(donor1.address);
      expect(d.charity).to.equal(charity1.address);
      expect(d.amount).to.equal(amount);
    });

    it("should track donor donation indices", async function () {
      await contract.connect(donor1).donate(charity1.address, { value: toWei("0.1") });
      await contract.connect(donor1).donate(charity1.address, { value: toWei("0.2") });

      const indices = await contract.getDonorDonationIndices(donor1.address);
      expect(indices.length).to.equal(2);
    });
  });

  // ─── 5. Rejection of Donation to Unverified Charity ─────────────────────

  describe("Donation to Unverified Charity", function () {
    it("should reject donation to unregistered charity", async function () {
      await expect(
        contract.connect(donor1).donate(charity1.address, { value: toWei("0.1") })
      ).to.be.revertedWith("Charity not registered");
    });

    it("should reject donation to pending charity", async function () {
      await contract.registerCharity(charity1.address);
      await expect(
        contract.connect(donor1).donate(charity1.address, { value: toWei("0.1") })
      ).to.be.revertedWith("Charity is not verified");
    });

    it("should reject donation to rejected charity", async function () {
      await contract.registerCharity(charity1.address);
      await contract.rejectCharity(charity1.address);
      await expect(
        contract.connect(donor1).donate(charity1.address, { value: toWei("0.1") })
      ).to.be.revertedWith("Charity is not verified");
    });
  });

  // ─── 6. Zero-value Donation Rejection ────────────────────────────────────

  describe("Zero-value Donation", function () {
    it("should reject zero-value donations", async function () {
      await contract.registerCharity(charity1.address);
      await contract.verifyCharity(charity1.address);

      await expect(
        contract.connect(donor1).donate(charity1.address, { value: 0 })
      ).to.be.revertedWith("Donation amount must be greater than zero");
    });
  });

  // ─── 7. Total Donation Count ──────────────────────────────────────────────

  describe("Donation History & Totals", function () {
    it("should track total donations globally", async function () {
      await contract.registerCharity(charity1.address);
      await contract.verifyCharity(charity1.address);
      await contract.registerCharity(charity2.address);
      await contract.verifyCharity(charity2.address);

      await contract.connect(donor1).donate(charity1.address, { value: toWei("0.1") });
      await contract.connect(donor1).donate(charity2.address, { value: toWei("0.2") });
      await contract.connect(donor2).donate(charity1.address, { value: toWei("0.3") });

      expect(await contract.totalDonations()).to.equal(3n);
    });

    it("should return correct charity donation indices", async function () {
      await contract.registerCharity(charity1.address);
      await contract.verifyCharity(charity1.address);

      await contract.connect(donor1).donate(charity1.address, { value: toWei("0.1") });
      await contract.connect(donor2).donate(charity1.address, { value: toWei("0.1") });

      const indices = await contract.getCharityDonationIndices(charity1.address);
      expect(indices.length).to.equal(2);
    });
  });
});

// Helper to get approximate current block timestamp
async function getTimestamp() {
  const block = await ethers.provider.getBlock("latest");
  return block.timestamp;
}
