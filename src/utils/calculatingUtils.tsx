import { createClient } from 'urql'

export const calculateUSDValue = async(value: number | string | any, token: string) => {

	const wethPriceQuery = `
{
	bundle(id: "1" ) {
	 ethPrice
 }
}
`

	const aavePriceQuery = `
{
	bundle(id: "1" ) {
	 ethPrice
   }
   pair(id: "0xdfc14d2af169b0d36c4eff567ada9b2e0cae044f"){
	   token0 {
		 derivedETH
	   }
   }
  }
`

	const wmaticPriceQuery = `
{
	bundle(id: "1" ) {
	 ethPrice
   }
   pair(id: "0x819f3450da6f110ba6ea52195b3beafa246062de"){
	   token0 {
		 derivedETH
	   }
   }
  }
`

	const oceanPriceQuery = `
{
	bundle(id: "1" ) {
	 ethPrice
   }
   pair(id: "0x9b7dad79fc16106b47a3dab791f389c167e15eb0"){
	   token0 {
		 derivedETH
	   }
   }
  }
`

	const daiPriceQuery = `
{
	bundle(id: "1" ) {
	 ethPrice
   }
   pair(id: "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11"){
	   token0 {
		 derivedETH
	   }
   }
  }
`
	const usdcPriceQuery = `
{
	bundle(id: "1" ) {
	 ethPrice
   }
   pair(id: "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc"){
	   token0 {
		 derivedETH
	   }
   }
  }
`

	const client = createClient({
		url: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2',
	})

	let amount = 0

	async function fetchWethPrice() {
		const data = await client.query(wethPriceQuery).toPromise()
		amount = data.data.bundle.ethPrice * value
	}

	async function fetchDaiPrice() {
		const data = await client.query(daiPriceQuery).toPromise()
		amount = data.data.pair.token0.derivedETH * data.data.bundle.ethPrice * value
	}

	async function fetchUsdcPrice() {
		const data = await client.query(usdcPriceQuery).toPromise()
		amount = data.data.pair.token0.derivedETH * data.data.bundle.ethPrice * value
	}

	async function fetchWmaticPrice() {
		const data = await client.query(wmaticPriceQuery).toPromise()
  	amount = data.data.pair.token0.derivedETH * data.data.bundle.ethPrice * value
	}

	async function fetchAavePrice() {
		const data = await client.query(aavePriceQuery).toPromise()
		amount = data.data.pair.token0.derivedETH * data.data.bundle.ethPrice * value
	}

	async function fetchOceanPrice() {
		const data = await client.query(oceanPriceQuery).toPromise()
		amount = data.data.pair.token0.derivedETH * data.data.bundle.ethPrice * value
	}

	if(token === 'WMATIC') {
		await fetchWmaticPrice()
	}

	if(token === 'AAVE') {
		await fetchAavePrice()
	}

	if(token === 'WETH') {
  	await fetchWethPrice()
	}

	if(token === 'OCEAN') {
		await fetchOceanPrice()
	}

	if(token === 'DAI') {
		await fetchDaiPrice()
	}

	if(token === 'USDC') {
		await fetchUsdcPrice()
	}

	return amount
}

export const useTimeDifference = (first: number, second: number) => {
	const msPerMinute = 60 * 1000
	const msPerHour = msPerMinute * 60
	const msPerDay = msPerHour * 24
	const msPerWeek = msPerDay * 7
	const msPerMonth = msPerDay * 30
	const msPerYear = msPerDay * 365

	const elapsed = first - second

	if(elapsed < msPerMinute) {
		return Math.round(elapsed / 1000) + 's'
	} else if(elapsed < msPerHour) {
		return Math.round(elapsed / msPerMinute) + 'min'
	} else if(elapsed < msPerDay) {
		return Math.round(elapsed / msPerHour) + 'h'
	} else if(elapsed < msPerWeek) {
		return Math.round(elapsed / msPerDay) + 'd'
	} else if(elapsed < msPerMonth) {
		return Math.round(elapsed / msPerWeek) + 'w'
	} else if(elapsed < msPerYear) {
		return Math.round(elapsed / msPerMonth) + 'm'
	} else {
		return Math.round(elapsed / msPerYear) + 'y'
	}
}

export const getAverageTime = (fundingDates: Array<number>, grantDates: Array<number>) => {
	const oneSecond = 60 * 1
	const oneMinute = 60 * 1000
	const oneHour = oneMinute * 60
	const oneDay = oneHour * 24
	const oneWeek = oneDay * 7
	const twoWeeks = oneWeek * 2

  let fundingDatesAverage = 0
  let grantCreationAverage = 0
  let average = 0

  if (fundingDates.length >= 1){
	fundingDatesAverage = (fundingDates.reduce((sum: any, a: any) => sum + a, 0).toFixed(0)) / fundingDates.length;
	grantCreationAverage = (grantDates.reduce((sum: any, a: any) => sum + a, 0).toFixed(0)) / grantDates.length;
  }

	average = fundingDatesAverage - grantCreationAverage

  if (average < oneSecond) {
    return '--'
  }	else if(average < oneMinute) {
		return Math.round(average / 1000) + 's'
	} else if(average < oneHour) {
		return Math.round(average / oneMinute) + 'min'
	} else if(average < oneDay) {
		return Math.round(average / oneHour) + 'h'
	} else if(average < oneWeek) {
		return Math.round(average / oneDay) + 'd'
	} else if(average < twoWeeks) {
		return Math.round(average / oneWeek) + 'w'
	} else if(average >= twoWeeks) {
		return '--'
	}
}
