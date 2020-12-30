const userShema = require('../shemas/userShema');
const cryptodynastyModel = require('../models/cryptoDynastyModel');

module.exports = class cryptodynastyController {

    async empty(req, res){
        var user = ""
        if(req.user != undefined){
          const userShemas = await userShema.find({email : req.session.passport.user}).exec()
          user = userShemas[0]
        };
        res.render('cryptodynasty/home.pug', { user: user}) 
    }

    async holder(req, res){
        var user = ""
        if(req.user != undefined){
          const userShemas = await userShema.find({email : req.session.passport.user}).exec()
          user = userShemas[0]
        };
        
        var CryptodynastyModel = new cryptodynastyModel;
        
        var data = [];

        var getPoolRewardHisto = await CryptodynastyModel.getPoolRewardHisto();
        var DataForLastRewar = JSON.parse(getPoolRewardHisto);
        DataForLastRewar = DataForLastRewar.rows[DataForLastRewar.rows.length-1];
        DataForLastRewar = DataForLastRewar.total_eos;
        DataForLastRewar = DataForLastRewar.substr(0,4);

        data.push(getPoolRewardHisto); // [0]

        var getTKTAmount = await CryptodynastyModel.getTKTAmount();
        var result = JSON.parse(getTKTAmount);
        var staked = result.rows[0].staked;
        var unstaked = result.rows[0].unstaking;
        staked = parseInt(staked.replace("TKT",""));
        unstaked = parseInt(unstaked.replace("TKT",""));
        var totalTKT = staked + unstaked;
        var pourcTKTunstaked = ((staked/totalTKT)*100).toFixed(2);
        //view adaptation
        var totalTKT = parseFloat((totalTKT/1000000).toFixed(3));
        staked = parseFloat((staked/1000000).toFixed(3));
        unstaked = parseFloat((unstaked/1000000).toFixed(3));
        data.push(staked); // [1]
        data.push(totalTKT); // [2]
        data.push(unstaked); //[3]
        data.push(pourcTKTunstaked); //[4]
        data.push(DataForLastRewar); //[5]

        //TKT Price
        const SellModel = require('../models/SellShema');

        // Using query builder
        SellModel
            .find({ $or: [{id_element: "301"}, {id_element: "302"}, {id_element: "303"}] })
            .limit(50)
            .exec(function(err,result){
                var amountTKT = 0;
                var amountEOS = 0;
                for(let i = 0; i<result.length; i++){
                    switch(result[i].id_element){
                        case "301": amountTKT = amountTKT + 1000;
                        break;
                        case "302": amountTKT = amountTKT + 10000;
                        break;
                        case "303": amountTKT = amountTKT + 100000;
                    }
                    amountEOS = amountEOS + result[i].amount;
                };
                var prix = amountEOS/amountTKT;
                var prix1000 = prix*1000;
                
                data.push(prix1000.toFixed(3)); //[6]

            //TKT by EOS for reward
            data.push((staked/DataForLastRewar).toFixed(2)); //[7]
            
            //Annual Rent.
            //Value for 1 EOS
            var RewardWeightPrice = (data[7]*1000)*data[6];
            var AnnualRent = RewardWeightPrice/365;
            data.push(AnnualRent.toFixed(2)); //[8]
            

                res.render('cryptodynasty/holder.pug', { user: user, dataHTML : data }) 
            })
    }
    
}