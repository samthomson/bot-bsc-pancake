
import { BigNumber, ethers } from 'ethers'

const { ANKR_WSS, PRIVATE_KEY } = process.env

const WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
const BUSD = '0xe9e7cea3dedca5984780bafc599bd69add087d56'


// pancake factory
// '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73'

const pair = '0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16'
const router = '0x10ED43C718714eb63d5aA57B78B54704E256024E'

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

	if (conversion <= 385 && shouldBuy) {
		console.log('buy WBNB with BUSD')

		const BUSDAmountIn = ethers.utils.parseUnits('10', 18)
		const amounts: BigNumber = await routerContract.getAmountsOut(BUSDAmountIn, [BUSD, WBNB])
		
		// min 10% slippage...!
		const WBNBAmountOutMin = amounts[1].sub(amounts[1].div(10))
		

		try {
			const tx = await routerContract.swapExactTokensForTokens(
				BUSDAmountIn,
				WBNBAmountOutMin,
				[WBNB, BUSD],
				wallet.address,
				Date.now() + 1000 * 60 * 10,
				// todo: below gas is wrong and transaction not going through
				// {gasLimit: 5200000 }
				// { gasLimit: 350000, gasPrice: 1000000000 }
				{
					gasPrice: ethers.utils.parseUnits('20', 'gwei'),
					gasLimit: 250000,
					nonce: 445
				}
			)

			const finished = await tx.wait()
			console.log(finished)
			process.exit()

			// just buy once
			shouldBuy = false

		} catch (err) {
			console.error(err)
			process.exit()
		}
	}


})