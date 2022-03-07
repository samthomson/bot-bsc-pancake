# bot bsc pancake

Simple bot that trades erc20s on pancake swap, on binance smart chain.

Built for pancake swap, but should work the same with any uniswap fork (ie uniswap, sushiswap, quickswap).

Based on: https://www.youtube.com/watch?v=GK7rLwOg10Q

## setup

`docker-compose build` and `docker-compose run app yarn`

## run

**Either:**
bash into the `app` container with `docker-compose run app sh` and then run `yarn run init` separately, staying in the container's scope.
***or***
run the script in the container from outwith the container (on the/your host machine), `docker-compose run app yarn run init`, then return to the host scope after.

## about

docs: Pancake swap [factory](https://docs.pancakeswap.finance/code/smart-contracts/pancakeswap-exchange/factory-v2) and [router](https://docs.pancakeswap.finance/code/smart-contracts/pancakeswap-exchange/router-v2).

Factory contract `0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73`
