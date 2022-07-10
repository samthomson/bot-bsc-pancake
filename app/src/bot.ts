
import { BigNumber, ethers } from 'ethers'

const { ANKR_WSS, PRIVATE_KEY } = process.env

const WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
const BUSD = '0xe9e7cea3dedca5984780bafc599bd69add087d56'


// pancake factory
// '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73'

const pair = '0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16'
const router = '0x10ED43C718714eb63d5aA57B78B54704E256024E'


const main = async () => {
	const provider = new ethers.providers.WebSocketProvider(ANKR_WSS)
	const wallet = new ethers.Wallet(PRIVATE_KEY)
	const signer = wallet.connect(provider)
	let shouldBuy = true

	const pairContract = new ethers.Contract(
		pair,
		[
			'event Swap(address indexed sender, uint amount0In, uint amount1In, uint amount0Out, uint amount1Out, address indexed to)',
			'function getReserves() public view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)'
		],
		signer
	)

	const routerContract = new ethers.Contract(
		router,
		[
			// 814
			'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
			// 611
			'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'
		],
		signer
	)

	pairContract.on('Swap', async () => {
		console.log('swap occurred')

		if (!shouldBuy) {
			console.log('skipping')
			return
		}
		// just buy once
		shouldBuy = false

		const pairData = await pairContract.getReserves()
		const bnbReserve = ethers.utils.formatUnits(pairData[0], 18)
		const usdReserve = ethers.utils.formatUnits(pairData[1], 18)
		const conversion = Number(usdReserve) / Number(bnbReserve)

		console.log(`
		******************************
		BlockTimestamp: ${pairData[2]}
		WBNB Reserve: ${bnbReserve}
		BUSD Reserve: ${usdReserve}
		WBNB Price: ${conversion}
		******************************
		`)

		if (conversion <= 240) {

			console.log('buy WBNB with BUSD')

			const BUSDAmountIn = ethers.utils.parseUnits('10', 18)
			const amounts: BigNumber = await routerContract.getAmountsOut(BUSDAmountIn, [BUSD, WBNB])
			
			// max 1.5% slippage...!
			const slippage = amounts[1].mul(15).div(1000)
			const WBNBAmountOutMin = amounts[1].sub(slippage)
			
			try {

				const gasLimit = 200000;
				const gasPrice = 5

				const tx = await routerContract.swapExactTokensForTokens(
					BUSDAmountIn,
					WBNBAmountOutMin,
					// buy the second thing (WBNB) with the first (BUSD).
					[BUSD, WBNB],
					wallet.address,
					Date.now() + 1000 * 60 * 10,
					{ gasPrice: ethers.utils.parseUnits(gasPrice.toString(), 'gwei'), gasLimit: gasLimit },
				)

				console.log('tx', tx)


				const finished = await tx.wait()
				console.log(finished)
				process.exit()


			} catch (err) {
				console.error(err)
				process.exit()
			}
		}
	})
}

main()