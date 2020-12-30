const coreModelAbstract = require('./coreModelAbstract');
const GreymassInterface = require('../interface/greymassInterface');

module.exports = class cryptodynastyModel extends coreModelAbstract {

    /*
    * va chercher historique pool reward
    */
    async getPoolRewardHisto() {
      //construct specific payload for request
      var greymassInterface = new GreymassInterface("cryptodynasty", "tktdividhist", 10000);
      await this.hTTPRequest.query(greymassInterface.url, greymassInterface.payload, greymassInterface.HTTPVerb)
        .then( 
          result => { 
            this.hTTPRequest.responseBody = result.body;
            return this.hTTPRequest.query(greymassInterface.url, greymassInterface.payload, greymassInterface.HTTPVerb);
        });
      return this.hTTPRequest.responseBody;
    }

  /*
  * va chercher les infos concernant le max, le stacked ect
  */
   async getTKTAmount(){
    //construct specific payload for request
    var greymassInterface = new GreymassInterface("cryptodynasty", "tktstakestat", 1);
    await this.hTTPRequest.query(greymassInterface.url, greymassInterface.payload, greymassInterface.HTTPVerb)
      .then( 
        result => { 
          this.hTTPRequest.responseBody = result.body;
          return this.hTTPRequest.query(greymassInterface.url, greymassInterface.payload, greymassInterface.HTTPVerb);
      });
    return this.hTTPRequest.responseBody;
  }

}