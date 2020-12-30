module.exports = class DataOperation {
    
    async sanitizeString( input ) {
        if(input.indexOf("<script>") !== -1){
            console.log(input.indexOf("<script>"))
            input = input.replace(/<script>/gi,"")
            input = input.replace(/<\/script>/gi,"")
        }
        return input
    }
}