# Atom's Time Tracker

With all things Atom, the goal is to create an open-source, free to use tool aimed at simplifying the lives of the technologist.  You can kill your self with overbearing processes, but to maintain a complex system, you must be well informed.  Working your way from startups with you and a few close friends to the large enterprise consulting engagements, you inevitably find your self at the point that you need to do some form of time accounting.

There are a ton of tools on the market for timesheets, why would I create yet another one?  The gap I see, everything out there is working to track time down to the hour or even the minute.  In most cases, that is what you need, and if you are here looking for a time tracking tool, I would recommend you look at the other tools out there, and try one first.  If you can make tracking by the hour or minute work, you should.

But, some times tracking time down to the minute, sucks the life out of a team. So as long as you don't need time tracking for the accountants, why not allow each member to select their unit of choice and then compute a relative time spent by each person on each project.  Letting each person operate how they work best, and can still generate managements beloved KPIs.

# Requirements

I am running this with Azure Web Apps, and Azure SQL.  This is the only way I am going to test this code; your mileage may vary.

Currently only Azure AD has been test, while it may be posable other OpenID providers could work, I have not tested it.

There are a few role that must exist, and they must be included in the OpenID tokens.

For AzureAD they are (see AzureAd/AppManifest_Sample.json for a sample application mmanifest)

```JSON
"appRoles": [
        {
            "allowedMemberTypes": ["User"],
            "description": "User who can create time periods and manage projects",
            "displayName": "Administrators",
            "id": "253bf5c5-eafd-4e3f-a0d1-170019b7da9d",
            "isEnabled": true,
            "lang": null,
            "origin": "Application",
            "value": "Admin"
        },
        {
            "allowedMemberTypes": ["User"],
            "description": "User who can submitt time Sheets",
            "displayName": "Time Sheet",
            "id": "2b33f772-0cb8-4abd-9dfe-4cfa16f037a7",
            "isEnabled": true,
            "lang": null,
            "origin": "Application",
            "value": "TimeSheet"
        }
    ]
```

# Docker Image

Atom's Time is available via a Docker image

```docker push atomsproject/atomstime:latest```

## Tags:

- latest : Stable build
- beta : may still have some bugs to work out, but should be mostly working
- dev : Work in progress, most probably will have bugs ang brake things.

## Enviroment Vars

- ConnectionStrings__SqlDbConnection : MSSQL connection String
- AzureAd__Domain : Your Azure AD domain name
- AzureAd__TenantId : Your Azure AD Tenant ID (GUILD)
- AzureAd__ClientId : The Client ID from the Azure AD Application

# Note to the wise

This is a pet project of mine; I am only putting the energy into this as needed to get done what I need.  This project is provided as-is; please do not expect any support for this code.  If you find a bug, please feel free to make a PR.  But if you want some new capabilities, please fork the project and have at it.
