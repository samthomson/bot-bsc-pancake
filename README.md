# bot bsc pancake

Simple bot that trades erc20s on pancake swap, on binance smart chain.

Built for pancake swap, but should work the same with any uniswap fork (ie uniswap, sushiswap, quickswap).

## setup

`docker-compose build` and `docker-compose run app yarn`

## run

**Either:**
bash into the `app` container with `docker-compose run app sh` and then run `yarn run init` separately, staying in the container's scope.
***or***
run the script in the container from outwith the container (on the/your host machine), `docker-compose run app yarn run init`, then return to the host scope after.
