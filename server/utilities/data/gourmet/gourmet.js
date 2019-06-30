const _ = require('lodash');
const config = require('config');
// const functions = require('functions'),
//   utils = functions.utils,
//   sequelize = functions.sequelize;

// const TableHints = sequelize.TableHints;
// var models = require('models').db,
// 	BankBranch = models.bankBranches,
// 	BranchAddressMapping = models.bankBranchAddressMapping,
// 	Banks = models.banks,
// 	CbsBanks = models.cbsBanks,
// 	Pacs = models.pacs;

module.exports = {
	
	customQuery: function(query,replacements) {
		// return sequelize.query(query, {replacements: replacements});
		return 1
	}
}