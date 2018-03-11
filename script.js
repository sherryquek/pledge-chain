/**
 * Script for defining transactions
 */

/**
* @param {org.acme.model.requestPledge} args - the requestPledge transaction
arguments
* @transaction
*/
function requestPledge(args) {
  // disallow pledges for limited pledge types that have reached the limit
  if (args.template.limit && args.template.currentPledged && args.template.currentPledged == args.template.limit) {
    throw new Error("Pledge limit reached.");
  }
  
  // route transaction through payments API and get output
  var transactionSuccess = true; // assign result from payments API. If didn't go through, throw error.
  
  // keep track of current number of pledges
  if (args.template.limit && args.template.currentPledged && args.template.currentPledged < args.template.limit) {
    args.template.currentPledged += 1;
  }
  
  return getAssetRegistry('org.acme.model.Pledge').then(function(pledgeRegistry) {
    var factory = getFactory();
    var pledgeId = args.template.proj.projName + "_" + args.user.username;
    var newPledge = factory.newResource('org.acme.model', 'Pledge', pledgeId);
    newPledge.owner = args.user;
    newPledge.amountPledged = args.amountPledged;
    newPledge.proj = args.template.proj;
    newPledge.entitlements = args.template.entitlements;
    newPledge.isActive = true;
	return pledgeRegistry.add(newPledge);
  });
}