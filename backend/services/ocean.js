const axios = require('axios')
const { cleanDomain } = require("../utils/cleanDomain");

async function findSimilarCompanies(domain) {
    try{


        console.log("[1/4] Finding similar companies.")
        const response = await axios.post(
            "https://api.ocean.io/v3/search/companies",
             {
                size: 1,
                companiesFilters: {
                lookalikeDomains: [domain],
            },
        },
        {
            headers: {
                "x-api-token": process.env.OCEAN_API_KEY,
                "Content-Type": "application/json",
                },
            }
        );
        // console.log(response.data)

        const companies = response.data.companies || []
        
       const domains = companies
        .map((item) =>
            cleanDomain(item.company.rootUrl)
    )

        console.log("Companies found!!")

        domains.forEach((company,index)=> {
            console.log(`${index+1}. ${company}`)
        })

        return domains;
        
    }catch(err){
        console.log("Ocean.io Error was found: ",err.message)
        if (err.response) {
            console.log("Ocean.io status:", err.response.status)
            console.log("Ocean.io response body:", JSON.stringify(err.response.data))
        }
        return []
    }
}

module.exports = {
    findSimilarCompanies,
}