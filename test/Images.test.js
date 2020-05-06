const Images = artifacts.require("Images");
require('chai')
	.use(require('chai-as-promised'))
	.should()
contract('Images', (accounts) => {
	let images
	before(async () => {
		images = await Images.deployed()
	})
	describe('deployment', async () => {
		it('depolys successfully', async () => {
			const address = images.address
			assert.notEqual(address, 0x0)
			assert.notEqual(address, '')
			assert.notEqual(address, null)
			assert.notEqual(address, undefined)
		})
	})
	describe('storage', async () => {
		it('updates the imageHash', async () => {
			let imageHash
			imageHash = 'abc123'
			await images.set(imageHash)
			const result = await images.get()
			assert.equal(result, imageHash)
		})
	})
})