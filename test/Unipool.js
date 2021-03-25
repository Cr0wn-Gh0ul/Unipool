const { BN, time } = require('openzeppelin-test-helpers');
const { expect } = require('chai');

const Uni = artifacts.require('UniMock');
const Snx = artifacts.require('ZiotMock');
const Unipool = artifacts.require('UnipoolMock');

async function timeIncreaseTo (seconds) {
    const delay = 10 - new Date().getMilliseconds();
    await new Promise(resolve => setTimeout(resolve, delay));
    await time.increaseTo(seconds);
}

const almostEqualDiv1e18 = function (expectedOrig, actualOrig) {
    const _1e18 = new BN('10').pow(new BN('18'));
    const expected = expectedOrig.div(_1e18);
    const actual = actualOrig.div(_1e18);
    this.assert(
        expected.eq(actual) ||
        expected.addn(1).eq(actual) || expected.addn(2).eq(actual) ||
        actual.addn(1).eq(expected) || actual.addn(2).eq(expected),
        'expected #{act} to be almost equal #{exp}',
        'expected #{act} to be different from #{exp}',
        expectedOrig.toString(),
        actualOrig.toString(),
    );
};

require('chai').use(function (chai, utils) {
    chai.Assertion.overwriteMethod('almostEqualDiv1e18', function (original) {
        return function (value) {
            if (utils.flag(this, 'bignumber')) {
                var expected = new BN(value);
                var actual = new BN(this._obj);
                almostEqualDiv1e18.apply(this, [expected, actual]);
            } else {
                original.apply(this, arguments);
            }
        };
    });
});

contract('Unipool', function ([_, wallet1, wallet2, wallet3, wallet4]) {
    describe('Unipool', async function () {
        beforeEach(async function () {
            this.uni = await Uni.new();
            this.snx = await Snx.new();
            this.pool = await Unipool.new(this.uni.address, this.snx.address);

            await this.pool.setRewardDistribution(wallet1);

            await this.snx.mint(this.pool.address, web3.utils.toWei('1000000'));
            await this.uni.mint(wallet1, web3.utils.toWei('1000'));
            await this.uni.mint(wallet2, web3.utils.toWei('1000'));
            await this.uni.mint(wallet3, web3.utils.toWei('1000'));
            await this.uni.mint(wallet4, web3.utils.toWei('1000'));

            await this.uni.approve(this.pool.address, new BN(2).pow(new BN(255)), { from: wallet1 });
            await this.uni.approve(this.pool.address, new BN(2).pow(new BN(255)), { from: wallet2 });
            await this.uni.approve(this.pool.address, new BN(2).pow(new BN(255)), { from: wallet3 });
            await this.uni.approve(this.pool.address, new BN(2).pow(new BN(255)), { from: wallet4 });

            this.started = (await time.latest()).addn(10);
            await timeIncreaseTo(this.started);
        });

        it('Two stakers with the same stakes wait 1 year', async function () {
            await this.pool.notifyRewardAmount(web3.utils.toWei('600000'), { from: wallet1 });

            expect(await this.pool.rewardPerToken()).to.be.bignumber.almostEqualDiv1e18('0');
            expect(await this.pool.earned(wallet1)).to.be.bignumber.equal('0');
            expect(await this.pool.earned(wallet2)).to.be.bignumber.equal('0');

            await this.pool.stake(web3.utils.toWei('1'), { from: wallet1 });
            await this.pool.stake(web3.utils.toWei('1'), { from: wallet2 });

            expect(await this.pool.rewardPerToken()).to.be.bignumber.almostEqualDiv1e18('0');
            expect(await this.pool.earned(wallet1)).to.be.bignumber.equal('0');
            expect(await this.pool.earned(wallet2)).to.be.bignumber.equal('0');

            await timeIncreaseTo(this.started.add(time.duration.days(365)));

            expect(await this.pool.rewardPerToken()).to.be.bignumber.almostEqualDiv1e18(web3.utils.toWei('300000'));
            expect(await this.pool.earned(wallet1)).to.be.bignumber.almostEqualDiv1e18(web3.utils.toWei('300000'));
            expect(await this.pool.earned(wallet2)).to.be.bignumber.almostEqualDiv1e18(web3.utils.toWei('300000'));
        });
        it('Two stakers with the same stakes wait 1 month', async function () {
            await this.pool.notifyRewardAmount(web3.utils.toWei('600000'), { from: wallet1 });

            expect(await this.pool.rewardPerToken()).to.be.bignumber.almostEqualDiv1e18('0');
            expect(await this.pool.earned(wallet1)).to.be.bignumber.equal('0');
            expect(await this.pool.earned(wallet2)).to.be.bignumber.equal('0');

            await this.pool.stake(web3.utils.toWei('1'), { from: wallet1 });
            await this.pool.stake(web3.utils.toWei('1'), { from: wallet2 });

            expect(await this.pool.rewardPerToken()).to.be.bignumber.almostEqualDiv1e18('0');
            expect(await this.pool.earned(wallet1)).to.be.bignumber.equal('0');
            expect(await this.pool.earned(wallet2)).to.be.bignumber.equal('0');

            await timeIncreaseTo(this.started.add(time.duration.days(30)));

            expect(await this.pool.rewardPerToken()).to.be.bignumber.almostEqualDiv1e18(web3.utils.toWei('24657'));
            expect(await this.pool.earned(wallet1)).to.be.bignumber.almostEqualDiv1e18(web3.utils.toWei('24657'));
            expect(await this.pool.earned(wallet2)).to.be.bignumber.almostEqualDiv1e18(web3.utils.toWei('24657'));
        });

        it('Two stakers with the same stakes wait 1 day', async function () {
            await this.pool.notifyRewardAmount(web3.utils.toWei('600000'), { from: wallet1 });

            expect(await this.pool.rewardPerToken()).to.be.bignumber.almostEqualDiv1e18('0');
            expect(await this.pool.earned(wallet1)).to.be.bignumber.equal('0');
            expect(await this.pool.earned(wallet2)).to.be.bignumber.equal('0');

            await this.pool.stake(web3.utils.toWei('1'), { from: wallet1 });
            await this.pool.stake(web3.utils.toWei('1'), { from: wallet2 });

            expect(await this.pool.rewardPerToken()).to.be.bignumber.almostEqualDiv1e18('0');
            expect(await this.pool.earned(wallet1)).to.be.bignumber.equal('0');
            expect(await this.pool.earned(wallet2)).to.be.bignumber.equal('0');

            await timeIncreaseTo(this.started.add(time.duration.days(1)));

            expect(await this.pool.rewardPerToken()).to.be.bignumber.almostEqualDiv1e18(web3.utils.toWei('822'));
            expect(await this.pool.earned(wallet1)).to.be.bignumber.almostEqualDiv1e18(web3.utils.toWei('822'));
            expect(await this.pool.earned(wallet2)).to.be.bignumber.almostEqualDiv1e18(web3.utils.toWei('822'));
        });

        it('Two stakers with the different (1:3) stakes wait 1 w', async function () {
            // 600000 SNX per week
            await this.pool.notifyRewardAmount(web3.utils.toWei('600000'), { from: wallet1 });

            expect(await this.pool.rewardPerToken()).to.be.bignumber.almostEqualDiv1e18('0');
            expect(await this.pool.balanceOf(wallet1)).to.be.bignumber.equal('0');
            expect(await this.pool.balanceOf(wallet2)).to.be.bignumber.equal('0');
            expect(await this.pool.earned(wallet1)).to.be.bignumber.equal('0');
            expect(await this.pool.earned(wallet2)).to.be.bignumber.equal('0');

            await this.pool.stake(web3.utils.toWei('1'), { from: wallet1 });
            await this.pool.stake(web3.utils.toWei('3'), { from: wallet2 });

            expect(await this.pool.rewardPerToken()).to.be.bignumber.almostEqualDiv1e18('0');
            expect(await this.pool.earned(wallet1)).to.be.bignumber.equal('0');
            expect(await this.pool.earned(wallet2)).to.be.bignumber.equal('0');

            await timeIncreaseTo(this.started.add(time.duration.days(365)));

            expect(await this.pool.rewardPerToken()).to.be.bignumber.almostEqualDiv1e18(web3.utils.toWei('150000'));
            expect(await this.pool.earned(wallet1)).to.be.bignumber.almostEqualDiv1e18(web3.utils.toWei('150000'));
            expect(await this.pool.earned(wallet2)).to.be.bignumber.almostEqualDiv1e18(web3.utils.toWei('450000'));
        });
    });
});
