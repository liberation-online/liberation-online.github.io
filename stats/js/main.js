const version = "v0.0.10";

var stats = [];
var stats_updated_count = 0;
var networkId = 0; // the blockchain network id

/* these globals are written to once the values are loaded, and used by the mining calculator */
var current_diff_saved = 0;
var next_diff_saved = 0;
var saved_current_block_reward = 0;
var latest_eth_block = null;

/* todo: move these into some kind of contract helper class */
var _BLOCKS_PER_READJUSTMENT = 512;
var contract_address = "";
var _MAXIMUM_TARGET_STR = "27606985387162255149739023449108101809804435888681546220650096895197184";  // 2**234
var _MAXIMUM_TARGET_BN = new Eth.BN(_MAXIMUM_TARGET_STR, 10);
var _MINIMUM_TARGET = 2**16;
var _MINIMUM_TARGET_BN = new Eth.BN(_MINIMUM_TARGET);
var _ZERO_BN = new Eth.BN(0, 10);
var token = "";

el('#footerversion').innerHTML = version;

/* colors used by pool names. todo: move to css, still use them for chart.js */
var pool_colors = {
  orange      : "#C64500",
/* colors below here are not assigned yet */
  purple      : "#4527A0",
  blue        : "#0277BD",
  green       : "#2E7D32",
  yellow      : "#997500",
  darkpurple  : "#662354",
  darkred     : "hsl(356, 48%, 30%)",
  teal        : "#009688",
  red         : "#f44336",
  pink        : "#e91e63",
  lightpurple : "#9c27b0",
  lime        : "#cddc39",
  brown       : "#8d6e63",
  grey        : "#78909c",
}
//var eth = new Eth(new Eth.HttpProvider("https://mainnet.infura.io/MnFOXCPE2oOhWpOCyEBT"));
var showHeaderInfo = false;
if (typeof window.web3 !== 'undefined' && typeof window.web3.currentProvider !== 'undefined') {
   var eth = new Eth(window.web3.currentProvider);
   showHeaderInfo = false;
} else {
  //@todo - how do we support test and main net if here?
   var eth = new Eth(new Eth.HttpProvider("https://mainnet.infura.io/unCoVZQ6Dl02rNv4tUXv"));
   log("warning: no web3 provider found, using infura.io as backup provider")
}

//web3.version.getNetwork((err, netId) => {
eth.net_version((err, netId) => {
  var network = "Unknown Network";
 switch (netId) {
   case "1":
     network = "Main Ethereum Network";
     contract_address = "0x2BF91c18Cd4AE9C2f2858ef9FE518180F7B5096D";
     break
   case "2":
     network = "Deprecated Morden Network";
     break
   case "3":
     network = "Ropsten Test Network";
     contract_address = "0x43c6017adBc11D00E35Ec6a6c496071E150dd2CE";
     break
   case "4":
     network = "Rinkeby Test Network";
     break
   case "42":
     network = "Kovan Test Network";
     break
   default:
 }
 networkId = netId;
 token = eth.contract(tokenABI).at(contract_address);

 eth.coinbase().then((result) => {

   // display connected account
   el_safe('#coinbaseAccount').innerHTML = result;

   //display Kiwi account owned by connected account
   token.balanceOf(result).then((balance) => {
       el_safe('#kiwiCount').innerHTML = (balance.balance / 100000000).toString(10);
   });

  }).catch((error) => {});

 el_safe('#contractAddress').innerHTML = contract_address;
 el_safe('#networkName').innerHTML = network;

 /* move fetching/storing stats into a class, even just to wrap it */
 console.log("network id: ", networkId);
 stats = [
   /*Description                     promise which retuns, or null         units         multiplier  null: filled in later*/
   //['',                              null,                                 "",           1,          null     ], /* mining difficulty */
   ['Mining Difficulty',             token.getMiningDifficulty,            "",           1,          null     ], /* mining difficulty */
   ['Estimated Hashrate',            null,                                 "Mh/s",       1,          null     ], /* mining difficulty */
   ['Rewards Until Readjustment',    null,                                 "",           1,          null     ], /* mining difficulty */
   ['Current Average Reward Time',   null,                                 "minutes",    1,          null     ], /* mining difficulty */
   ['Last Difficulty Start Block',   token.latestDifficultyPeriodStarted,  "",           1,          null     ], /* mining difficulty */
   ['Tokens Minted',                 token.tokensMinted,                   "KIWI",      0.00000001, null     ], /* supply */
   ['Max Supply for Current Era',    token.maxSupplyForEra,                "KIWI",      0.00000001, null     ], /* mining */
   ['Supply Remaining in Era',       null,                                 "KIWI",      0.00000001, null     ], /* mining */
   ['Last Eth Reward Block',         token.lastRewardEthBlockNumber,       "",           1,          null     ], /* mining */
   ['Last Eth Block',                eth.blockNumber,                      "",           1,          null     ], /* mining */
   ['Current Reward Era',            token.rewardEra,                      "/ 39",       1,          null     ], /* mining */
   ['Current Mining Reward',         token.getMiningReward,                "KIWI",      0.00000001, null     ], /* mining */
   ['Epoch Count',                   token.epochCount,                     "",           1,          null     ], /* mining */
   ['Total Supply',                  token.totalSupply,                    "KIWI",      0.00000001, null     ], /* supply */
   //['Mining Target',                 token.miningTarget,                   "",           1,          null     ], /* mining */
   //['',                              null,                                 "",           1,          null     ], /* */
   //['Token Holders',                 null,                                 "holders",    1,          null     ], /* usage */
   //['Token Transfers',               null,                                 "transfers",  1,          null     ], /* usage */
   ['Total Contract Operations',     null,                                 "txs",        1,          null     ], /* usage */
   ];

});


eth.blockNumber().then((value)=>{
  latest_eth_block = parseInt(value.toString(10), 10);
});


function ethBlockNumberToDateStr(eth_block) {
  //log('converting', eth_block)
  //log('latest e', latest_eth_block)
  /* TODO: use web3 instead, its probably more accurate */
  /* blockDate = new Date(web3.eth.get bBlock(startBlock-i+1).timestamp*1000); */
  return new Date(Date.now() - ((latest_eth_block - eth_block)*15*1000)).toLocaleDateString()
}

function ethBlockNumberToTimestamp(eth_block) {
  //log('converting', eth_block)
  //log('latest e', latest_eth_block)
  /* TODO: use web3 instead, its probably more accurate */
  /* blockDate = new Date(web3.eth.getBlock(startBlock-i+1).timestamp*1000); */
  return new Date(Date.now() - ((latest_eth_block - eth_block)*15*1000)).toLocaleString()
}

function secondsToReadableTime(seconds) {
  if(seconds <= 0) {
    return "0 seconds";
  }

  units = ['years', 'months', 'days', 'hours', 'minutes', 'seconds'];
  divisors = [365.25*24*60*60, 30.4*24*60*60, 24*60*60, 60*60, 60, 1]
  for(idx in units) {
    var unit = units[idx];
    var divisor = divisors[idx];
    if(seconds > divisor) {
      return (seconds / divisor).toFixed(1) + ' ' + unit;
    }
  }
  return seconds.toFixed(1) + ' ' + 'seconds';
}

function toReadableThousands(num_value, should_add_b_tags) {
  units = ['', 'K', 'M', 'B'];
  var final_unit = 'T';
  for(idx in units) {
    var unit = units[idx];
    if(num_value < 1000) {
      final_unit = unit;
      break;
    } else {
      num_value /= 1000;
    }
  }
  var num_value_string = num_value.toFixed(2);

  if(num_value_string.endsWith('.00')) {
    num_value_string = num_value.toFixed(0);
  }

  if(should_add_b_tags) {
    num_value_string = '<b>' + num_value_string + '</b>';
  }
  return num_value_string + ' ' + final_unit;
}

function toReadableThousandsLong(num_value, should_add_b_tags) {
  units = ['', 'Thousand', 'Million', 'Billion'];
  var final_unit = 'Trillion';
  for(idx in units) {
    var unit = units[idx];
    if(num_value < 1000) {
      final_unit = unit;
      break;
    } else {
      num_value /= 1000;
    }
  }
  var num_value_string = num_value.toFixed(0);
  if(should_add_b_tags) {
    num_value_string = '<b>' + num_value_string + '</b>';
  }
  return num_value_string + ' ' + final_unit;
}

function toReadableHashrate(hashrate, should_add_b_tags) {
  units = ['H/s', 'Kh/s', 'Mh/s', 'Gh/s', 'Th/s', 'Ph/s'];
  var final_unit = 'Eh/s';
  for(idx in units) {
    var unit = units[idx];
    if(hashrate < 1000) {
      final_unit = unit;
      break;
    } else {
      hashrate /= 1000;
    }
  }
  var hashrate_string = hashrate.toFixed(2);

  if(hashrate_string.endsWith('.00')) {
    hashrate_string = hashrate.toFixed(0);
  }

  if(should_add_b_tags) {
    hashrate_string = '<b>' + hashrate_string + '</b>';
  }
  return hashrate_string + ' ' + final_unit;
}

function getValueFromStats(name, stats) {
  value = null
  stats.forEach(function(stat){
    if (stat[0] === name) {
      value = stat[4];
    }})
  return value
}

function setValueInStats(name, value, stats) {
  stats.forEach(function(stat){
    if (stat[0] === name) {
      stat[4] = value;
      return;
    }});
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function updateStatsThatHaveDependencies(stats) {
  /* estimated hashrate */
  difficulty = getValueFromStats('Mining Difficulty', stats)
  if(mining_calculator_app) {
    mining_calculator_app.setCurrentDifficulty(difficulty);
    mining_calculator_app.useCurrentDiff();
  }
  //hashrate = difficulty * 2**22 / 600
  //hashrate /= 1000000000
  //el('#EstimatedHashrate').innerHTML = "<b>" + hashrate.toFixed(2) + "</b> Gh/s";

  /* supply remaining in era */
  max_supply_for_era = getValueFromStats('Max Supply for Current Era', stats)
  current_supply = getValueFromStats('Tokens Minted', stats)
  current_reward = getValueFromStats('Current Mining Reward', stats)
  if(mining_calculator_app) {
    mining_calculator_app.setBlockReward(current_reward);
  }
  supply_remaining_in_era = max_supply_for_era - current_supply; /* TODO: probably need to round to current mining reward */
  rewards_blocks_remaining_in_era = supply_remaining_in_era / current_reward;
  el_safe('#SupplyRemaininginEra').innerHTML = "<b>" + supply_remaining_in_era.toLocaleString() + "</b> KIWI <span style='font-size:0.8em;'>(" + rewards_blocks_remaining_in_era + " blocks)</span>";

  /* time until next epoch ('halvening') */
  el_safe('#CurrentRewardEra').innerHTML += " <span style='font-size:0.8em;'>(next era: ~" + secondsToReadableTime(rewards_blocks_remaining_in_era * 120) + ")</div>";

  /* rewards until next readjustment */
  epoch_count = getValueFromStats('Epoch Count', stats)
  rewards_since_readjustment = epoch_count % _BLOCKS_PER_READJUSTMENT
  rewards_left = _BLOCKS_PER_READJUSTMENT - rewards_since_readjustment
  el_safe('#RewardsUntilReadjustment').innerHTML = "<b>" + rewards_left.toString(10) + "</b>";

  /* time per reward block */
  current_eth_block = getValueFromStats('Last Eth Block', stats)
  difficulty_start_eth_block = getValueFromStats('Last Difficulty Start Block', stats)

  /* Add timestamp to 'Last difficulty start block' stat */
  el_safe('#LastDifficultyStartBlock  ').innerHTML += "<span style='font-size:0.8em;'>(" + ethBlockNumberToTimestamp(difficulty_start_eth_block) + ")</span>";

  /* time calculated using 15-second eth blocks */
  var eth_blocks_since_last_difficulty_period = current_eth_block - difficulty_start_eth_block;
  var seconds_since_readjustment = eth_blocks_since_last_difficulty_period * 15

  seconds_per_reward = seconds_since_readjustment / rewards_since_readjustment;
  minutes_per_reward = (seconds_per_reward / 60).toFixed(2)
  el_safe('#CurrentAverageRewardTime').innerHTML = "<b>" + minutes_per_reward + "</b> minutes";
  /* add a time estimate to RewardsUntilReadjustment */
  el_safe('#RewardsUntilReadjustment').innerHTML += "  <span style='font-size:0.8em;'>(~" + secondsToReadableTime(rewards_left*minutes_per_reward*60) + ")</span>";

  /* calculate next difficulty */
  //var current_mining_target = getValueFromStats('Mining Target', stats);
  var new_mining_target = calculateNewMiningDifficulty(difficulty,
                                                       eth_blocks_since_last_difficulty_period,
                                                       rewards_since_readjustment);
  el_safe('#MiningDifficulty').innerHTML = difficulty;
  //el_safe('#MiningDifficulty').innerHTML += "  <span style='font-size:0.8em;'>(next: ~" + new_mining_target.toLocaleString() + ")</span>";
  if(mining_calculator_app) {
    mining_calculator_app.setNextDifficulty(new_mining_target);
  }
  /* estimated hashrate */
  //difficulty = getValueFromStats('Mining Difficulty', stats)

  hashrate = difficulty * 2**22 / 120;
  console.log("Difficulty: ", difficulty);
  if(difficulty < 1000) {
      hashrate = 1000 * 2**22 / 120;
  }
  /* use current reward rate in hashrate calculation */
  hashrate *= (2 / minutes_per_reward)
  setValueInStats('Estimated Hashrate', hashrate, stats);
  el_safe('#EstimatedHashrate').innerHTML = toReadableHashrate(hashrate, true);
}

function updateLastUpdatedTime() {
  var time = new Date();
  current_time = time.toLocaleTimeString();
  el('#LastUpdatedTime').innerHTML = current_time;
}

function updateThirdPartyAPIs() {
  /* ethplorer token info */
  $.getJSON('https://api.ethplorer.io/getTokenInfo/0x2BF91c18Cd4AE9C2f2858ef9FE518180F7B5096D?apiKey=freekey',
    function(data) {
      el('#TokenHolders').innerHTML = "<b>" + data["holdersCount"] + "</b> holders";
      el('#TokenTransfers').innerHTML = "<b>" + data["transfersCount"] + "</b> transfers";
  });
  /* ethplorer contract address info */
  $.getJSON('https://api.ethplorer.io/getAddressInfo/0x2BF91c18Cd4AE9C2f2858ef9FE518180F7B5096D?apiKey=freekey',
    function(data) {
      el('#TotalContractOperations').innerHTML = "<b>" + data["countTxs"] + "</b> txs";
  });
}

function showBlockDistributionPieChart(piechart_dataset, piechart_labels) {

  el('#blockdistributionpiechart').innerHTML = '<canvas id="chart-block-distribution" width="2rem" height="2rem"></canvas>';

  if(piechart_dataset.length == 0 || piechart_labels.length == 0) {
    return;
  }

  //Chart.defaults.global.elements.arc.backgroundColor = 'rgba(255,0,0,1)';
  Chart.defaults.global.elements.arc.borderColor = 'rgb(32, 34, 38)';
  Chart.defaults.global.elements.arc.borderWidth = 3;

  /* hashrate and difficulty chart */
  var hr_diff_chart = new Chart(document.getElementById('chart-block-distribution').getContext('2d'), {
    type: 'doughnut',

    data: {
        datasets: [piechart_dataset],
        labels: piechart_labels,
    },

    options: {
      borderWidth: 0,
      legend: {
        display: false,
      },
    },
  });
}

function getMinerColor(address, known_miners) {
  function simpleHash(seed, string) {
    var h = seed;
    for (var i = 0; i < string.length; i++) {
      h = ((h << 5) - h) + string[i].codePointAt();
      h &= 0xFFFFFFFF;
    }
    return h;
  }

  if(known_miners[address] !== undefined) {
    var hexcolor = known_miners[address][2];
  } else {
    //var address_url = 'https://etherscan.io/address/' + address;
    //var hexcolor = (simpleHash(7, address) & 0xFFFFFF) | 0x000000;
    hexcolor = 'hsl(' + (simpleHash(2, address) % 360) + ', 48%, 30%)';

  }
  return hexcolor;
}

function getMinerName(address, known_miners) {
  if(known_miners[address] !== undefined) {
    return known_miners[address][0];
  } else {
    return address.substr(0, 14) + '...';
  }
}

function getMinerNameLinkHTML(address, known_miners) {
  var hexcolor = getMinerColor(address, known_miners);
  var poolstyle = '<span style="background-color: ' + hexcolor + ';" class="poolname">';

  if(known_miners[address] !== undefined) {
    var readable_name = known_miners[address][0];
    var address_url = known_miners[address][1];
  } else {
    var readable_name = address.substr(0, 14) + '...';
    var address_url = 'https://etherscan.io/address/' + address;
  }

  return '<a href="' + address_url + '">' + poolstyle + readable_name + '</span></a>';
}

/* TODO use hours_into_past */
function updateAllMinerInfo(eth, stats, hours_into_past){

  var known_miners = {
    "0x0546c90c9092D0A8f982c59766D2963b171F5D44" : [ "Adam (The KIWI)", "http://thekiwi.online",     pool_colors.purple ],
    "0xdad9518386543693cf61954993732a87a15c3a93" : [ "Wolf Pool", "http://kiwi.wolfpool.io",     pool_colors.blue ],
    "0x3b10fa943c7b43641c184e21732c37b9bc8a6e16" : [ "KIWI Private Pool", "http://thekiwi.onlin", pool_colors.green]
  }

  var last_reward_eth_block = getValueFromStats('Last Eth Reward Block', stats)
  var current_eth_block = getValueFromStats('Last Eth Block', stats)
  var estimated_network_hashrate = getValueFromStats('Estimated Hashrate', stats)
  var last_difficulty_start_block = getValueFromStats('Last Difficulty Start Block', stats)

  //var num_eth_blocks_to_search = hours_into_past * 60 * 60 / 15;
  var num_eth_blocks_to_search = last_reward_eth_block - last_difficulty_start_block;
  //log("searching last", num_eth_blocks_to_search, "blocks");

  /* get all mint() transactions in the last N blocks */
  /* more info: https://github.com/ethjs/ethjs/blob/master/docs/user-guide.md#ethgetlogs */
  /* and https://ethereum.stackexchange.com/questions/12950/what-are-event-topics/12951#12951 */
  eth.getLogs({
    fromBlock: last_reward_eth_block - num_eth_blocks_to_search,
    toBlock: last_reward_eth_block,
    address: '0x2bf91c18cd4ae9c2f2858ef9fe518180f7b5096d',
    topics: ['0xcf6fbb9dcea7d07263ab4f5c3a92f53af33dffc421d9d121e1c74b307e68189d', null],
  })
  .then((result) => {
    /* array of all miner addresses */
    var miner_list = [];
    /* array of arrays of type [eth_block, txhash, miner_addr] */
    var mined_blocks = [];
    /* dict where key=miner_addr and value=total_mined_block_count */
    var miner_block_count = {};
    /* total number of blocks mined in this filter */
    var total_block_count = result.length;

    //log("got filter results:", total_block_count, "transactions");

    result.forEach(function(transaction){
      function getMinerAddressFromTopic(address_from_topic) {
        return '0x' + address_from_topic.substr(26, 41);
      }
      var tx_hash = transaction['transactionHash'];
      var block_number = parseInt(transaction['blockNumber'].toString());
      var miner_address = getMinerAddressFromTopic(transaction['topics'][1].toString());

      // log('tx_hash=', tx_hash);
      // log('  block=', block_number);
      // log('  miner=', miner_address)

      if(!miner_list.includes(miner_address)){
        miner_list.push(miner_address);
      }

      mined_blocks.push([block_number, tx_hash, miner_address])

      if(miner_block_count[miner_address] === undefined) {
        miner_block_count[miner_address] = 1;
      } else {
        miner_block_count[miner_address] += 1;
      }
    });

    //log("processed blocks:",Object.keys(miner_block_count).length,"unique miners");

    /* we will eventually show newest blocks first, so reverse the list */
    mined_blocks.reverse();

    /* collapse miner_block_count using known_miners who have multiple
       address into a single address */
    for(var m1 in miner_block_count) {
      for(var m2 in miner_block_count) {
        if(m1 === m2) {
          continue;
        }
        if(known_miners[m1] !== undefined
           && known_miners[m2] !== undefined
           && known_miners[m1][0] == known_miners[m2][0]) {
          miner_block_count[m1] += miner_block_count[m2];
          miner_block_count[m2] = 0;
        }
      }
    }

    /* delete miners with zero blocks (due to collapse op above) */
    Object.keys(miner_block_count).forEach((miner_addr) => {
      if(miner_block_count[miner_addr] == 0) {
        delete miner_block_count[miner_addr]
      }
    });

    /* create sorted list of miners */
    sorted_miner_block_count = []
    for(var m in miner_block_count) {
      sorted_miner_block_count.push([m, miner_block_count[m]]);
    }
    /* descending */
    sorted_miner_block_count.sort((a, b) => {return b[1] - a[1];});

    //log('done sorting miner info');

    /* fill in miner info */
    var piechart_labels = [];
    var piechart_dataset = {
      data: [],
      backgroundColor: [],
      label: 'miner-data'
    };
    var innerhtml_buffer = '<tr><th>Miner</th><th>Block Count</th>'
      + '<th>% of Total</th><th>Hashrate (Estimate)</th></tr>';
    sorted_miner_block_count.forEach(function(miner_info) {
      var addr = miner_info[0];
      var blocks = miner_info[1];
      var miner_name_link = getMinerNameLinkHTML(addr, known_miners);
      var percent_of_total_blocks = blocks/total_block_count;

      piechart_dataset.data.push(blocks);
      piechart_dataset.backgroundColor.push(getMinerColor(addr, known_miners))
      piechart_labels.push(getMinerName(addr, known_miners))

      innerhtml_buffer += '<tr><td>'
        + miner_name_link + '</td><td>'
        + blocks + '</td><td>'
        + (100*percent_of_total_blocks).toFixed(2) + '%' + '</td><td>'
        + toReadableHashrate(percent_of_total_blocks*estimated_network_hashrate, false) + '</td></tr>';
    });
    /* add the last row (totals) */
    /*
    innerhtml_buffer += '<tr><td style="border-bottom: 0rem;"></td><td style="border-bottom: 0rem;">'
      + total_block_count + '</td><td style="border-bottom: 0rem;"></td><td style="border-bottom: 0rem;">'
      + toReadableHashrate(estimated_network_hashrate, false) + '</td></tr>';
      */
    el('#minerstats').innerHTML = innerhtml_buffer;
    //log('done populating miner stats');
    // $(window).hide().show(0);
    // $(window).trigger('resize');

    showBlockDistributionPieChart(piechart_dataset, piechart_labels);

    var blocks_since_last_reward = current_eth_block - last_reward_eth_block;
    var date_now = new Date();
    var date_of_last_mint = new Date(date_now.getTime() - blocks_since_last_reward*15*1000)

    function get_date_from_eth_block(eth_block) {
      /* TODO: use web3 instead, its probably more accurate */
      /* blockDate = new Date(web3.eth.getBlock(startBlock-i+1).timestamp*1000); */
      return new Date(date_of_last_mint.getTime() - ((last_reward_eth_block - eth_block)*15*1000)).toLocaleString()
    }

    function get_gas_price_from_transaction(tx_hash) {

      if(typeof(web3) !== 'undefined') {
          web3.eth.getTransaction(tx_hash, function(e, r){
            if(!e) {
              el_safe('#tx' + tx_hash).innerHTML = parseInt(web3.fromWei(r.gasPrice, 'Gwei'),10);
            };
          });
        } else {
          el_safe('#tx' + tx_hash).innerHTML = "~";
        }
      }

    /* fill in block info */
    var dt = new Date();
    var innerhtml_buffer = '<tr><th>Time (Approx)</th><th>Eth Block #</th>'
      + '<th>Transaction Hash</th><th>Gas Price (Gwei)<th>Miner</th></tr>';
    mined_blocks.forEach(function(block_info) {
      var eth_block = parseInt(block_info[0]);
      var tx_hash = block_info[1];
      var addr = block_info[2];

      var miner_name_link = getMinerNameLinkHTML(addr, known_miners);

      var transaction_url = 'https://etherscan.io/tx/' + tx_hash;
      var block_url = 'https://etherscan.io/block/' + eth_block;

      //log('hexcolor:', hexcolor, address_url);

      innerhtml_buffer  += '<tr><td>'
        + get_date_from_eth_block(eth_block) + '</td><td>'
        + '<a href="' + block_url + '">' + eth_block + '</td><td>'
        + '<a href="' + transaction_url + '" title="' + tx_hash + '">'
        + tx_hash.substr(0, 16) + '...</a></td>'
        + '<td id="tx'+ tx_hash + '">' + get_gas_price_from_transaction(tx_hash) + '</td>'
        //+ '<td></td>''
        + '<td align="right" style="text-overflow:ellipsis;white-space: nowrap;overflow: hidden;">'
        + miner_name_link + '</td></tr>';
        //+ '</a></td></tr>';
    });
    el('#blockstats').innerHTML = innerhtml_buffer;
    //log('done populating block stats');

    goToURLAnchor();
  })
  .catch((error) => {
    log('error filtering txs:', error);
  });


}

function createStatsTable(){
  stats.forEach(function(stat){
    stat_name = stat[0]
    stat_function = stat[1]
    stat_unit = stat[2]
    stat_multiplier = stat[3]

    el('#statistics').innerHTML += '<tr><td>'
      + stat_name + '</td><td id="'
      + stat_name.replace(/ /g,"") + '"></td></tr>';
  });
}

function areAllBlockchainStatsLoaded(stats) {
  all_loaded = true;

  stats.forEach(function(stat){
    stat_name = stat[0]
    stat_function = stat[1]
    stat_unit = stat[2]
    stat_multiplier = stat[3]
    stat_value = stat[4]
    /* if there is a function without an associated value, we are still waiting */
    if(stat_function !== null && stat_value === null) {
      all_loaded = false;
    }
  })

  if(all_loaded) {
    return true;
  } else {
    return false;
  }
}

function updateStatsTable(stats){
  stats.forEach(function(stat){
    stat_name = stat[0]
    stat_function = stat[1]
    stat_unit = stat[2]
    stat_multiplier = stat[3]

    set_value = function(stats, stat_name, stat_unit, stat_multiplier, save_fn) {
      return function(result) {
        try {
          result = result[0].toString(10)
        } catch (err) {
          result = result.toString(10)
        }

        result = result.toString(10)*stat_multiplier
        save_fn(result)

        /* modify some of the values on display */
        if(stat_name == "Total Supply") {
          result = result.toLocaleString();
        } else if(stat_name == "Mining Difficulty"
               || stat_name == "Tokens Minted"
               || stat_name == "Max Supply for Current Era"
               || stat_name == "Supply Remaining in Era"
               || stat_name == "Token Transfers"
               || stat_name == "Total Contract Operations") {
          result = result.toLocaleString()
        }

        el_safe('#' + stat_name.replace(/ /g,"")).innerHTML = "<b>" + result + "</b> " + stat_unit;

        /* once we have grabbed all stats, update the calculated ones */
        if(areAllBlockchainStatsLoaded(stats)) {
          updateStatsThatHaveDependencies(stats);
          /* hack: check if miner table exists - if it doesn't then skip loading blocks */
          if(el('#minerstats')) {
            setTimeout(()=>{updateAllMinerInfo(eth, stats, 24)}, 0);
          }
        }
      }
    }
    /* run promises that store stat values */
    if(stat_function !== null) {
      stat_function().then(set_value(stats, stat_name, stat_unit, stat_multiplier, (value) => {stat[4]=value}));
    }
  });

  /* hack: check if stat table exists - if it doesn't then skip api updates */
  if(el('#TokenHolders')) {
    updateThirdPartyAPIs();
  }
}

function loadAllStats() {
  updateStatsTable(stats);
}

function updateAndDisplayAllStats() {

  var delayInMilliseconds = 1000; //1 second - hack to make sure vars are populated
  setTimeout(function() {

    createStatsTable();
    loadAllStats();

  }, delayInMilliseconds);

}

function goToURLAnchor() {
  /* kind of a hack, after charts are loaded move to correct anchor. For some
     reason the viewport is forced to the top when creating the charts */
  if (window.location.hash.search('#difficulty') != -1) {
    // this one isn't really necessary because diffigulty graph is at top of screen
    //var targetOffset = $('#row-difficulty').offset().top;
    //$('html, body').animate({scrollTop: targetOffset}, 500);
  } else if (window.location.hash.search('#reward-time') != -1) {
    var targetOffset = $('#row-reward-time').offset().top;
    $('html, body').animate({scrollTop: targetOffset}, 500);
  }else if (window.location.hash.search('#miners') != -1) {
    var targetOffset = $('#row-miners').offset().top;
    $('html, body').animate({scrollTop: targetOffset}, 500);
  }else if (window.location.hash.search('#blocks') != -1) {
    var targetOffset = $('#row-blocks').offset().top;
    $('html, body').animate({scrollTop: targetOffset}, 500);
  }else if (window.location.hash.search('#miningcalculator') != -1) {
    // not necessary; calc is at top of screen
    //var targetOffset = $('#row-miningcalculator').offset().top;
    //$('html, body').animate({scrollTop: targetOffset}, 500);
  }
}


function calculateNewMiningDifficulty(current_difficulty,
                                      eth_blocks_since_last_difficulty_period,
                                      epochs_mined) {
  var current_mining_target = _MAXIMUM_TARGET_BN.div(new Eth.BN(current_difficulty));
  var eth_blocks_since_last_difficulty_period = new Eth.BN(eth_blocks_since_last_difficulty_period);
  var epochs_mined = new Eth.BN(epochs_mined);

  var target_eth_blocks_since_last_difficulty_period = epochs_mined.mul(new Eth.BN(60));

  if (target_eth_blocks_since_last_difficulty_period == 0) {
    return 0;
  }

  if(eth_blocks_since_last_difficulty_period.lt(target_eth_blocks_since_last_difficulty_period)) {
    //console.log('harder');
    var excess_block_pct = (target_eth_blocks_since_last_difficulty_period.mul(new Eth.BN(100))).div( eth_blocks_since_last_difficulty_period );
    var excess_block_pct_extra = excess_block_pct.sub(new Eth.BN(100));
    if (excess_block_pct_extra.gt(new Eth.BN(1000))) {
      excess_block_pct_extra = new Eth.BN(1000);
    }
    // If there were 5% more blocks mined than expected then this is 5.  If there were 100% more blocks mined than expected then this is 100.
    //make it harder
    var new_mining_target = current_mining_target.sub(current_mining_target.div(new Eth.BN(2000)).mul(excess_block_pct_extra));   //by up to 50 %
  }else{
    //console.log('easier');
    var shortage_block_pct = (eth_blocks_since_last_difficulty_period.mul(new Eth.BN(100))).div( target_eth_blocks_since_last_difficulty_period );
    var shortage_block_pct_extra = shortage_block_pct.sub(new Eth.BN(100));
    if (shortage_block_pct_extra.gt(new Eth.BN(1000))) {
      shortage_block_pct_extra = new Eth.BN(1000); //always between 0 and 1000
    }
    //make it easier
    var new_mining_target = current_mining_target.add(current_mining_target.div(new Eth.BN(2000)).mul(shortage_block_pct_extra));   //by up to 50 %
  }

  /* never gunna happen, probably. */
  if(new_mining_target.lt(_MINIMUM_TARGET_BN)) //very difficult
  {
    //console.log('hit minimum');
    new_mining_target = _MINIMUM_TARGET_BN;
  }
  if(new_mining_target.gt(_MAXIMUM_TARGET_BN)) //very easy
  {
    //console.log('hit maximum');
    new_mining_target = _MAXIMUM_TARGET_BN;
  }

  /* return difficulty as an integer */
  return parseInt(_MAXIMUM_TARGET_BN.div(new_mining_target).toString(10));
}

function addToURL(value){
  if (history.pushState) {
    var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + value;
    window.history.pushState({path:newurl},'',newurl);
  }
}
