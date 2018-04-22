/**
 * Script for defining transactions in the PledgeChain network
 */

/**
* @param {org.acme.model.requestPledge} args - the requestPledge transaction
arguments
* @transaction
*/
function requestPledge(args) {
  var template = args.template;
  
  	// disallow pledges for limited pledge types that have reached the limit
  	if (template.limit && template.currentPledged && template.currentPledged == template.limit) {
    	throw new Error("Pledge limit reached.");
  	}
  
  	// disallow pledges where the pledged amount is less than the minimum required amount
    if (args.amountPledged < template.minAmount) {
    	throw new Error("Amount pledged is insufficient.");
    }
  
  	// keep track of current number of pledges
    template.currentPledged = template.currentPledged + 1;
  
  
  	// create new Pledge asset assigned to the backer  
    var factory = getFactory();
    var pledgeId = template.referenceID + "_" + args.user.username; // assume each user pledges at most once to 1 type of pledge
    var newPledge = factory.newResource('org.acme.model', 'Pledge', pledgeId);
    newPledge.owner = args.user;
    newPledge.amountPledged = args.amountPledged;
    newPledge.proj = template.proj;
    newPledge.entitlement = template.entitlement;
    newPledge.isActive = false;
    newPledge.compensation = template.compensation;
  
   
  	// Update ProjectListing asset to keep track of issued pledges
    if (template.proj.issuedPledges) {
      template.proj.issuedPledges.push(newPledge);
    } else {
      template.proj.issuedPledges = [newPledge];
    }

  	// Update ProjectListing asset to keep track of current amount raised. If it exceeds funding target with this pledge, update the status to "Funded".
    template.proj.currRaised += args.amountPledged;
    if (template.proj.currRaised >= template.proj.fundingTarget) {
      template.proj.status = "Funded";
    }
  
  	// Update user information to include new Pledge asset
  	if (args.user.ownedPledges) {
      args.user.ownedPledges.push(newPledge);
    } else {
      args.user.ownedPledges = [newPledge];
    }
  
  return getAssetRegistry('org.acme.model.Pledge').then(function(pledgeRegistry) {
  	return pledgeRegistry.add(newPledge);
  }).then(function() {
  	return getAssetRegistry('org.acme.model.ProjectListing');
  }).then(function(projListingRegistry){
  	return projListingRegistry.update(template.proj);
  }).then(function() {
  	return getAssetRegistry('org.acme.model.PledgeTemplate');
  }).then(function(templateRegistry) {
  	return templateRegistry.update(template);
  }).then(function() {
  	return getParticipantRegistry('org.acme.model.User');
  }).then(function(userRegistry) {
  	return userRegistry.update(args.user);
  });

}

/**
* @param {org.acme.model.createProjListing} args - the create project listing transaction
* @transaction
*/
function createProjListing(args) {
	return getAssetRegistry('org.acme.model.ProjectListing').then(function(projListingRegistry) {
      
      	// creates a new project listing with input information
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
      
      	// Update creator's information to include new projectListing asset
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
  
  // creates a new template with input information.
  var factory = getFactory();
  var referenceID = args.proj.projId + "_" + args.proj.nPledgeTypes;
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
    
    // Updates the parent projectListing asset with new template information
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
    
    // Update project status to "Cancelled"
    args.proj.status = "Cancelled";
  	return projListingRegistry.update(args.proj); 
  });  
}

/**
* @param {org.acme.model.updateProjStatus} args - the updateProjStatus transaction for delivery service (to Shipping or Closed)
* @transaction
*/
function updateProjStatus(args) {
  
  // Updates project status to new project status
  args.proj.status = args.newStatus;
  
  return getAssetRegistry('org.acme.model.ProjectListing').then(function(projListingRegistry) {
  	return projListingRegistry.update(args.proj);
  });

}

/**
* @param {org.acme.model.updatePledgeStatus} args - the updatePledgeStatus transaction for delivery service (to isActive = false)
* @transaction
*/
function updatePledgeStatus(args) {
  
  // Updates pledge status to new pledge status
  args.pledge.isActive = false;
  
  return getAssetRegistry('org.acme.model.Pledge').then(function(pledgeListingRegistry) {
  	return pledgeListingRegistry.update(args.pledge);
  });

}

/**
* @param {org.acme.model.closeProjPayment} args - Closing Failed Projects
* @transaction
*/
function closeProjPayment(args) {
  	var projectsToUpdate = [];
	return getAssetRegistry('org.acme.model.ProjectListing').then(function(projListingRegistry) {
    	return projListingRegistry.getAll();
    }).then(function(projects) {
      
      // adds updated project to projectsToUpdate list if conditions are met for compensation or refunds to occur
      for (var i = 0; i < projects.length; i++) {
        	var currProj = projects[i];
        
        	// DateTime processing
        	var projFundEnd = currProj.fundingEndDate;
      		var fundingEnd = projFundEnd.getDate()+ "-" + (projFundEnd.getMonth()+1) + "-" + projFundEnd.getYear();
        	var projEnd = currProj.endDate;
      		var projCompletionEnd = projEnd.getDate()+ "-" + (projEnd.getMonth()+1) + "-" + projEnd.getYear();
        	var currEndDate = args.currDate.getDate()+ "-" + (args.currDate.getMonth()+1) + "-" + args.currDate.getYear();
  			
        	// Condition: project is cancelled by creator.
          	if (currProj.status == "Cancelled") {
                currProj.status = "Closed";
              	projectsToUpdate.push(currProj);
            }
          
        	// Condition: Funding target is not met by the funding end date.
          	if (currProj.status == "Funding" &&  fundingEnd == currEndDate) {
            	currProj.status = "Closed";
             	projectsToUpdate.push(currProj);
            }
          
        	// Condition: Funded project has not yet started shipping by the project end date.
          	if (currProj.status == "Funded" && projCompletionEnd == currEndDate) {
                currProj.status = "Closed";
              	projectsToUpdate.push(currProj);
            }
          
		}
    
      return getAssetRegistry('org.acme.model.ProjectListing');
    }).then(function(projListingRegistry) {
      	// Updates to close all projects.
    	return projListingRegistry.updateAll(projectsToUpdate);
    });
}

/**
* @param {org.acme.model.fundedProjPayment} args - Updating Pledge assets of funded projects
* @transaction
*/
function fundedProjPayment(args) {
  var pledgesToUpdate = [];
  return getAssetRegistry('org.acme.model.ProjectListing').then(function(projListingRegistry) {
  	return projListingRegistry.getAll();
  }).then(function(projects) {
  	for (var i = 0; i < projects.length; i++) {
      
      // DateTime processing
      var projEnd = projects[i].fundingEndDate;
      var fundingEnd = projEnd.getDate()+ "-" + (projEnd.getMonth()+1) + "-" + projEnd.getYear();
      var currEndDate = args.currDate.getDate()+ "-" + (args.currDate.getMonth()+1) + "-" + args.currDate.getYear();
      
      // Add a projectListing's pledges to pledgesToUpdate list if project is funded by the funding end date
      if (fundingEnd == currEndDate && projects[i].status == "Funded") {
      	pledgesToUpdate.push.apply(pledgesToUpdate, projects[i].issuedPledges);
      }
    }
    
    return getAssetRegistry('org.acme.model.Pledge');
  }).then(function(pledgeRegistry) {
    
    // Updates all pledge status to Active.
  	for (var i = 0; i < pledgesToUpdate.length; i++) {
      pledgesToUpdate[i].isActive = true;
    }
    return pledgeRegistry.updateAll(pledgesToUpdate);
  });
}