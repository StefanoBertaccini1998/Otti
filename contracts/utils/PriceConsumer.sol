// // SPDX-License-Identifier: UNLICENSED
// pragma solidity ^0.8.9;

// import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

// contract PriceConsumerV3 {
//     AggregatorV3Interface internal priceFeed;

//     /**
//      * Network: Polygon Mainet
//      * Aggregator: ETH/USD
//      * Address: 0xf9680d99d6c9589e2a93a78a04a279e509205945
//      * 
//      * Aggregator: Matic/USD
//      * Address: 0xab594600376ec9fd91f8e885dadf0ce036862de0
//      */
//     constructor(address clOracleAddress) {
//         priceFeed = AggregatorV3Interface(clOracleAddress);
//     }

//     /**
//      * Return latest price
//      */

//     function getLatestPrice() public view returns (int) {
//         (
//             ,
//             /* uint80 roundID */ int price,
//             ,
//             ,

//         ) = /* uint startedAt */ /*uint timeStamp */ /*uint80 answeredInRound */ priceFeed
//                 .latestRoundData();
//         return price;
//     }

//     function getPriceDecimals() public view returns (uint) {
//         return uint(priceFeed.decimals());
//     }
// }
