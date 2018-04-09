/**
 * Script for defining transactions
 */

/**
* @param {org.acme.model.requestPledge} args - the requestPledge transaction
arguments
* @transaction
*/
function requestPledge(args) {
  
  return getAssetRegistry('org.acme.model.PledgeTemplate').then(function(templateRegistry) {
    return templateRegistry.get(args.templateID);
  }).then(function(template) {
    // disallow pledges for limited pledge types that have reached the limit
    if (template.limit && template.currentPledged && template.currentPledged == template.limit) {
      throw new Error("Pledge limit reached.");
    }
  
    if (args.amountPledged < template.minAmount) {
      throw new Error("Amount pledged is insufficient.");
    }
    
    // route transaction through payments API and get output
    var transactionSuccess = true; // assign result from payments API. If didn't go through, throw error.

    // keep track of current number of pledges
    if (template.limit && template.currentPledged >= args.template.limit) {
      throw new Error("Limit reached for this pledge type.");
    }
    template.currentPledged += 1;
    
    var factory = getFactory();
    var pledgeId = template.referenceID + "_" + args.user.username; // assume each user pledges at most once to 1 type of pledge
    var newPledge = factory.newResource('org.acme.model', 'Pledge', pledgeId);
    newPledge.owner = args.user;
    newPledge.amountPledged = args.amountPledged;
    newPledge.proj = template.proj;
    newPledge.entitlement = template.entitlement;
    newPledge.isActive = true;
    newPledge.compensation = template.compensation;
    
    if (template.proj.issuedPledges) {
      template.proj.issuedPledges.push(newPledge);
    } else {
      template.proj.issuedPledges = [newPledge];
    }

    template.proj.currRaised += args.amountPledged;
    if (template.proj.currRaised >= template.proj.fundingTarget) {
      template.proj.status = "Funded";
    }
  }).then(function() {
    return getAssetRegistry('org.acme.model.Pledge');
  }).then(function(pledgeRegistry) {
    return pledgeRegistry.add(newPledge);
  }).then(function() {
    return getAssetRegistry('org.acme.model.ProjectListing');
  }).then(function(projListingRegistry){
    return projListingRegistry.update(template.proj);
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
      var factory = getFactory();
      var projId = args.projectID;
      var newProj = factory.newResource('org.acme.model', 'ProjectListing', projId);
        
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
      
        args.creator.projects.push(newProj);
      
        return projListingRegistry.add(newProj);
    }).then(function() {
      return getParticipantRegistry('org.acme.model.User');
    }).then(function(userRegistry) {
      return userRegistry.update(args.creator);
    });
}


/**
* @param {org.acme.model.addTemplate} args - the addTemplate transaction
* @transaction
*/
function addTemplate(args) {
  var factory = getFactory();
  referenceID = args.proj.projName + "_" + args.proj.nPledgeTypes;
  var newTemplate = factory.newResource('org.acme.model','PledgeTemplate', referenceID);
  newTemplate.proj = args.proj;
  newTemplate.minAmount = args.minAmount;
  newTemplate.currentPledged = 0;
  newTemplate.compensation = args.compensation;
  
  if (args.entitlement) {
    newTemplate.entitlement = args.entitlement;
  }

  if (args.limit) {
    newTemplate.limit = args.limit;
  }
  
  return getAssetRegistry('org.acme.model.PledgeTemplate').then(function(templateRegistry) {
    return templateRegistry.add(newTemplate);
  }).then(function() {
    return getAssetRegistry('org.acme.model.ProjectListing');
  }).then(function(projListingRegistry) {
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
  return getAssetRegistry('org.acme.model.ProjectListing').then(function(projListingRegistry) {
    args.proj.status = "Cancelled";
    return projListingRegistry.update(args.proj); 
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