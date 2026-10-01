const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("CharityDonation", function () {
  let contract;
  let owner;       // Admin / deployer
  let charity1;    // Charity wallet 1
  let charity2;    // Charity wallet 2
  let donor1;      // Donor 1
  let donor2;      // Donor 2
  let attacker;    // Unauthorized user

  beforeEach(async function () {
    [owner, charity1, charity2, donor1, donor2, attacker] =
      await ethers.getSigners();

    const CharityDonation = await ethers.getContractFactory("CharityDonation");
    contract = await CharityDonation.deploy();
    await contract.waitForDeployment();
  });

  // ─────────────────────────────────────────────
  // 1. CHARITY REGISTRATION
  // ─────────────────────────────────────────────
  describe("Charity Registration", function () {
    it("Should allow admin to register a charity", async function () {
      await contract.registerCharity(charity1.address, "Green Earth Initiative");
      const c = await contract.getCharity(charity1.address);
      expect(c.name).to.equal("Green Earth Initiative");
      expect(c.status).to.equal(0); // Pending = 0
    });

    it("Should emit CharityRegistered event", async function () {
      await expect(
        contract.registerCharity(charity1.address, "Green Earth Initiative")
      )
        .to.emit(contract, "CharityRegistered")
        .withArgs(charity1.address, "Green Earth Initiative", anyValue);
    });

    it("Should reject duplicate charity registration", async function () {
      await contract.registerCharity(charity1.address, "Green Earth");
      await expect(
        contract.registerCharity(charity1.address, "Green Earth Again")
      ).to.be.revertedWith("Already registered");
    });

    it("Should reject zero address charity", async function () {
      await expect(
        contract.registerCharity(ethers.ZeroAddress, "Bad Charity")
      ).to.be.revertedWith("Invalid address");
    });

    it("Should reject empty charity name", async function () {
      await expect(
        contract.registerCharity(charity1.address, "")
      ).to.be.revertedWith("Name required");
    });

    it("Should NOT allow non-admin to register charity", async function () {
      await expect(
        contract.connect(attacker).registerCharity(charity1.address, "Fake Charity")
      ).to.be.reverted;
    });
  });

  // ─────────────────────────────────────────────
  // 2. CHARITY VERIFICATION
  // ─────────────────────────────────────────────
  describe("Charity Verification", function () {
    beforeEach(async function () {
      await contract.registerCharity(charity1.address, "Green Earth Initiative");
    });

    it("Should allow admin to verify a charity", async function () {
      await contract.verifyCharity(charity1.address);
      const c = await contract.getCharity(charity1.address);
      expect(c.status).to.equal(1); // Verified = 1
    });

    it("Should emit CharityVerified event", async function () {
      await expect(contract.verifyCharity(charity1.address))
        .to.emit(contract, "CharityVerified")
        .withArgs(charity1.address, anyValue);
    });

    it("Should NOT allow non-admin to verify", async function () {
      await expect(
        contract.connect(attacker).verifyCharity(charity1.address)
      ).to.be.reverted;
    });

    it("Should return true for isCharityVerified after verification", async function () {
      await contract.verifyCharity(charity1.address);
      expect(await contract.isCharityVerified(charity1.address)).to.equal(true);
    });

    it("Should return false for isCharityVerified before verification", async function () {
      expect(await contract.isCharityVerified(charity1.address)).to.equal(false);
    });
  });

  // ─────────────────────────────────────────────
  // 3. CHARITY REJECTION
  // ─────────────────────────────────────────────
  describe("Charity Rejection", function () {
    beforeEach(async function () {
      await contract.registerCharity(charity1.address, "Suspicious Org");
    });

    it("Should allow admin to reject a charity", async function () {
      await contract.rejectCharity(charity1.address);
      const c = await contract.getCharity(charity1.address);
      expect(c.status).to.equal(2); // Rejected = 2
    });

    it("Should emit CharityRejected event", async function () {
      await expect(contract.rejectCharity(charity1.address))
        .to.emit(contract, "CharityRejected")
        .withArgs(charity1.address, anyValue);
    });

    it("Should NOT allow non-admin to reject", async function () {
      await expect(
        contract.connect(attacker).rejectCharity(charity1.address)
      ).to.be.reverted;
    });
  });

  // ─────────────────────────────────────────────
  // 4. DONATIONS
  // ─────────────────────────────────────────────
  describe("Donations", function () {
    beforeEach(async function () {
      await contract.registerCharity(charity1.address, "Green Earth Initiative");
      await contract.verifyCharity(charity1.address);
    });

    it("Should allow donation to a verified charity", async function () {
      const amount = ethers.parseEther("1.0");
      await contract.connect(donor1).donate(charity1.address, { value: amount });

      const c = await contract.getCharity(charity1.address);
      expect(c.totalReceived).to.equal(amount);
    });

    it("Should emit DonationReceived event", async function () {
      const amount = ethers.parseEther("0.5");
      await expect(
        contract.connect(donor1).donate(charity1.address, { value: amount })
      )
        .to.emit(contract, "DonationReceived")
        .withArgs(donor1.address, charity1.address, amount, 0, anyValue);
    });

    it("Should transfer ETH to charity wallet", async function () {
      const amount = ethers.parseEther("2.0");
      const initialBalance = await ethers.provider.getBalance(charity1.address);
      await contract.connect(donor1).donate(charity1.address, { value: amount });
      const finalBalance = await ethers.provider.getBalance(charity1.address);
      expect(finalBalance - initialBalance).to.equal(amount);
    });

    it("Should track donor donations", async function () {
      await contract
        .connect(donor1)
        .donate(charity1.address, { value: ethers.parseEther("1.0") });
      const ids = await contract.getDonorDonations(donor1.address);
      expect(ids.length).to.equal(1);
    });

    it("Should track charity donations", async function () {
      await contract
        .connect(donor1)
        .donate(charity1.address, { value: ethers.parseEther("1.0") });
      const ids = await contract.getCharityDonations(charity1.address);
      expect(ids.length).to.equal(1);
    });

    it("Should reject donation to unverified charity", async function () {
      await contract.registerCharity(charity2.address, "Unverified Org");
      await expect(
        contract
          .connect(donor1)
          .donate(charity2.address, { value: ethers.parseEther("1.0") })
      ).to.be.revertedWith("Charity not verified");
    });

    it("Should reject donation to rejected charity", async function () {
      await contract.registerCharity(charity2.address, "Rejected Org");
      await contract.rejectCharity(charity2.address);
      await expect(
        contract
          .connect(donor1)
          .donate(charity2.address, { value: ethers.parseEther("1.0") })
      ).to.be.revertedWith("Charity not verified");
    });

    it("Should reject zero-value donation", async function () {
      await expect(
        contract.connect(donor1).donate(charity1.address, { value: 0 })
      ).to.be.revertedWith("Donation must be greater than zero");
    });

    it("Should reject donation to unregistered charity", async function () {
      await expect(
        contract
          .connect(donor1)
          .donate(donor2.address, { value: ethers.parseEther("1.0") })
      ).to.be.revertedWith("Charity not registered");
    });

    it("Should reject self-donation", async function () {
      // Register charity1's address as donor trying to donate to themselves
      await contract.registerCharity(donor1.address, "Self Charity");
      await contract.verifyCharity(donor1.address);
      await expect(
        contract.connect(donor1).donate(donor1.address, { value: ethers.parseEther("1.0") })
      ).to.be.revertedWith("Cannot donate to yourself");
    });

    it("Should correctly get donation details", async function () {
      const amount = ethers.parseEther("1.0");
      await contract.connect(donor1).donate(charity1.address, { value: amount });

      const donation = await contract.getDonation(0);
      expect(donation.donor).to.equal(donor1.address);
      expect(donation.charity).to.equal(charity1.address);
      expect(donation.amount).to.equal(amount);
    });

    it("Should count total donations correctly", async function () {
      await contract
        .connect(donor1)
        .donate(charity1.address, { value: ethers.parseEther("1.0") });
      await contract
        .connect(donor2)
        .donate(charity1.address, { value: ethers.parseEther("0.5") });

      expect(await contract.getTotalDonations()).to.equal(2);
    });
  });

  // ─────────────────────────────────────────────
  // HELPER
  // ─────────────────────────────────────────────
  async function getTimestamp() {
    const block = await ethers.provider.getBlock("latest");
    return block.timestamp;
  }
});
