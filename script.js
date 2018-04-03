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
  
  if (args.amountPledged < args.template.minAmount) {
  	throw new Error("Amount pledged is insufficient.");
  }
  
  // route transaction through payments API and get output
  var transactionSuccess = true; // assign result from payments API. If didn't go through, throw error.
  
  // keep track of current number of pledges
  if (args.template.limit && args.template.currentPledged && args.template.currentPledged < args.template.limit) {
    args.template.currentPledged += 1;
  }
  
  var factory = getFactory();
  var pledgeId = args.template.proj.projName + "_" + args.template.referenceID + "_" + args.user.username; // assume each user pledges at most once to 1 type of pledge
    var newPledge = factory.newResource('org.acme.model', 'Pledge', pledgeId);
    newPledge.owner = args.user;
    newPledge.amountPledged = args.amountPledged;
    newPledge.proj = args.template.proj;
    newPledge.entitlement = args.template.entitlement;
    newPledge.isActive = true;
    newPledge.compensation = args.template.compensation;
  
  if (args.template.proj.issuedPledges) {
  	args.template.proj.issuedPledges.push(newPledge);
  } else {
  	args.template.proj.issuedPledges = [newPledge];
  }
  
  args.template.proj.currRaised += args.amountPledged;
  if (args.template.proj.currRaised >= args.template.proj.fundingTarget) {
  	args.template.proj.status = "Funded";
  }
  
  return getAssetRegistry('org.acme.model.Pledge').then(function(pledgeRegistry) {
	return pledgeRegistry.add(newPledge);
  }).then(function() {
    return getAssetRegistry('org.acme.model.ProjectListing');
  }).then(function(projListingRegistry) {
    return projListingRegistry.update(args.template.proj);
  });
}

/**
* @param {org.acme.model.updateStatus} args - the update pledge status transaction
* @transaction
*/
function updateStatus(args) {
  args.pledge.isActive = args.newActiveStatus;
  
  return getAssetRegistry('org.acme.model.Pledge').then(function(pledgeRegistry) {
  	return pledgeRegistry.update(args.pledge);
  });
}

/**
* @param {org.acme.model.createProjListing} args - the create project listing transaction
* @transaction
*/
function createProjListing(args) {
	return getAssetRegistry('org.acme.model.ProjectListing').then(function(projListingRegistry) {
    	var factory = new Factory();
    	var projId = args.projectID;
    	var newProj = factory.newResource('org.acme.model', 'ProjectListing', projID);
      	
      	newProj.projName = args.name;
        newProj.description = args.description;
        newProj.startDate = args.startDate;
        newProj.endDate = args.endDate;
        newProj.isOngoing = true;
      	newProj.nPledgeTypes = 0;
        newProj.creator = args.creator;
      	newProj.fundingTarget = args.fundingTarget;
      	newProj.currRaised = 0;
      	newProj.fundingEndDate = args.fundingEndDate;
      	newProj.status = "Funding";
      
      	return projListingRegistry.add(newProj);
    });
}


/**
* @param {org.acme.model.addTemplate} args - the addTemplate transaction
* @transaction
*/
function addTemplate(args) {
  var factory = getFactory();
  var newTemplate = factory.newConcept('org.acme.model','PledgeTemplate');
  newTemplate.proj = args.proj;
  newTemplate.minAmount = args.minAmount;
  newTemplate.currentPledged = 0;
  newTemplate.referenceID = args.proj.projName + "_" + args.proj.nPledgeTypes;
  newTemplate.compensation = args.compensation;
  
  if (args.entitlement) {
  	newTemplate.entitlement = args.entitlement;
  }

  if (args.limit) {
  	newTemplate.limit = args.limit;
  }

  return getAssetRegistry('org.acme.model.ProjectListing').then(function(projListingRegistry) {
    if (args.proj.pledgeTypes) {
    	args.proj.pledgeTypes.push(newTemplate);
    } else {
    	args.proj.pledgeTypes = [newTemplate];
    }
    
	args.proj.nPledgeTypes += 1;
	return projListingRegistry.update(args.proj);
  });
}

/**
* @param {org.acme.model.cancelProj} args - the cancelProj transaction for creators
* @transaction
*/
function cancelProj(args) {
	if (args.user != args.proj.creator) {
    	throw new Error("Only creators of a project are allowed to cancel it.");
    }
  	
  	args.proj.status = "Cancelled";	
  
  	return getAssetRegistry('org.acme.model.ProjectListing').then(function(projListingRegistry) {
    	projListingRegistry.update(args.proj);
    });
}

/**
* @param {org.acme.model.updateProjStatus} args - the updateProjStatus transaction for delivery service (to Shipping or Closed)
* @transaction
*/
function updateProjStatus(args) {
  args.proj.status = args.newStatus;
  
  return getAssetRegistry('org.acme.model.ProjectListing').then(function(projListingRegistry) {
  	return projListingRegistry.update(args.proj);
  });

}
