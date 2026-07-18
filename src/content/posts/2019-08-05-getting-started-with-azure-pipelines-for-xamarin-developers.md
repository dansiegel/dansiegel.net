---
title: "Getting Started with Azure Pipelines for Xamarin Developers"
description: "DevOps for Xamarin apps is a rather large topic. Rather than trying to go A-Z in one bite, I thought it might make more sense to divide this up into bite sized..."
publishedAt: "2019-08-05T04:06:00.000Z"
updatedAt: "2019-08-05T12:55:52.000Z"
categories: ["Xamarin"]
tags: ["Azure DevOps","DevOps","Xamarin","iOS","Android"]
legacyUrl: "/post/2019/08/05/getting-started-with-azure-pipelines-for-xamarin-developers"
heroImage: "/images/blog/getting-started-with-azure-pipelines-for-xamarin-developers/01-inline-b40ee4a2ab.webp"
draft: false
---
DevOps for Xamarin apps is a rather large topic. Rather than trying to go A-Z in one bite, I thought it might make more sense to divide this up into bite sized chunks. In this first article we'll take a look at how to get started with Azure DevOps (aka Azure Pipelines... aka I've lost track of what we're supposed to call it anymore)… Obviously the first thing you'll need to do is to create a new Azure DevOps organization (assuming you don't already have one). If you don't you'll want to head over to https://dev.azure.com and create one. You should see a dialog similar to this.

![Getting Started with Azure Pipelines for Xamarin Developers](/images/blog/getting-started-with-azure-pipelines-for-xamarin-developers/01-inline-b40ee4a2ab.webp)

After creating your new organization you'll need to setup a project. This project could be whatever you need. For the purposes of this article we'll call it' the Xamarin Mobile project and make it private.

![Getting Started with Azure Pipelines for Xamarin Developers](/images/blog/getting-started-with-azure-pipelines-for-xamarin-developers/02-inline-429b29dc89.webp)

Once you've created the project you should see something like this:

![Getting Started with Azure Pipelines for Xamarin Developers](/images/blog/getting-started-with-azure-pipelines-for-xamarin-developers/03-inline-850b5181bc.webp)

But we're still not done yet. As you'll notice there's a repos section in here. We could choose to use the FREE private git hosting in Azure DevOps. But if our code lives somewhere else such as GitHub we can keep using Azure DevOps for our CI/CD pipelines. If that's the case you may want to head to the Project Settings. All of the Azure DevOps services will be on by default, however you can choose what you want to use to narrow it down and focus the view on only what you'll be using.

![Getting Started with Azure Pipelines for Xamarin Developers](/images/blog/getting-started-with-azure-pipelines-for-xamarin-developers/04-inline-865aa826db.webp)

Remember that we've just set up a brand new Azure DevOps organization so we only have what's available out of the box, and that's really not sufficient for Xamarin Developers.

## Marketplace for Azure DevOps

To really light up Azure DevOps and make sure that we have the full power we need for our Xamarin CI Builds you'll want to head over to [https://marketplace.visualstudio.com](https://marketplace.visualstudio.com/) and make sure you're looking at the Azure DevOps tab. You may find a number of great extensions for 

![Getting Started with Azure Pipelines for Xamarin Developers](/images/blog/getting-started-with-azure-pipelines-for-xamarin-developers/05-inline-f7787950ad.webp)

The first two extensions you'll want to install I honestly cannot figure out why they are not included out of the box with Azure DevOps particularly since they're released by Microsoft.

-   [Apple App Store](https://marketplace.visualstudio.com/items?itemName=ms-vsclient.app-store&targetId=fe365dbf-73e2-42dc-b8c4-fe29ab058e42&utm_source=vstsproduct&utm_medium=ExtHubManageList "Apple App Store"): As the name implies this will give us an ability to deploy directly to the App Store and makes it very easy to get builds into Test Flight
-   [Google Play](https://marketplace.visualstudio.com/items?itemName=ms-vsclient.google-play&targetId=fe365dbf-73e2-42dc-b8c4-fe29ab058e42&utm_source=vstsproduct&utm_medium=ExtHubManageList "Google Play"): Again this extension will make it very easy to integrate and deploy directly to Google Play. We can deploy to an internal testers group, alpha, beta, or production as we see fit. NOTE: this extension does not currently support the new Android App Bundles (.aab)

The next two extensions are from our great friends on the on the Xamarin team but they are published individually and not by Microsoft as an organization.

-   [Mobile App Tasks for iOS and Android](https://marketplace.visualstudio.com/items?itemName=vs-publisher-473885.motz-mobile-buildtasks&targetId=fe365dbf-73e2-42dc-b8c4-fe29ab058e42&utm_source=vstsproduct&utm_medium=ExtHubManageList "Mobile App Tasks for iOS and Android"): This great extension from James Montemagno makes it very easy to provide a unique version for each build of our app. This is particularly important for those times where we may need to upload version 1.5 of our app to the app store 10 times to get through QA, and then the app review. By ensuring we have a unique Build number on each build of version 1.5 we can continue to upload new artifacts for testers and eventual release.
-   [Boots](https://marketplace.visualstudio.com/items?itemName=pjcollins.azp-utilities-boots&targetId=fe365dbf-73e2-42dc-b8c4-fe29ab058e42&utm_source=vstsproduct&utm_medium=ExtHubManageList "Boots"): Boots is an awesome .NET CLI Tool from Jonathan Peppers. Thanks to a little help from Peter Collins on the Xamarin team, it's been made even easier to use with this great extension. With this simple utility you can provide a download link for any Xamarin SDK such as an Alpha or nightly build of Mono, Xamarin.iOS or Xamarin.Android and it will download and install the SDK so that it's ready to use for your build.

Installing the Extensions

It really couldn't be easier to install the extensions. You can navigate directly to each extension in the marketplace by clicking on the links above. Then you will want to click the Get it free button. When you are getting ready to install the extension you'll see a screen like the one below. Be sure to take note of the organization as it may not have the organization selected for which you want to install to.

![Getting Started with Azure Pipelines for Xamarin Developers](/images/blog/getting-started-with-azure-pipelines-for-xamarin-developers/06-inline-77938a926f.webp)

## Secrets and Secure Files

Now that we have the extensions set up, lets head back into Azure DevOps and click on the Pipelines, and then the Library. The Library will give us an easy to manage location for our resources.

![Getting Started with Azure Pipelines for Xamarin Developers](/images/blog/getting-started-with-azure-pipelines-for-xamarin-developers/07-inline-eba0914033.webp)

To get started round up the Android keystore, and any provisioning profile and signing certificate you will need for your Android and iOS apps. Select the Secure Files tab and then start uploading your secure files. Note that there is a certain amount of insanity in this step as you just uploaded files that are currently unavailable to be used. You will need to open each file that you have just uploaded. You will see something like the following. Notice that the toggle switch for all of the pipelines to use this file is currently off, you will need to toggle it to the on position and then hit save.

![Getting Started with Azure Pipelines for Xamarin Developers](/images/blog/getting-started-with-azure-pipelines-for-xamarin-developers/08-inline-783524d302.webp)

Now we'll want to head back to the first tab we landed on and start adding some variable groups. How this looks for you may differ slightly based on your needs. In general though I tend to end up with 3 Variable Groups like the following:

-   Android-Signing
    -   AndroidKeystoreFileName
    -   AndroidKeystorePassword
    -   AndroidKeystoreAlias
-   iOS-Signing
    -   iOSDevelopmentCertificate
    -   iOSDevelopmentPassword
    -   iOSDevelopmentProvisioningProfile
    -   iOSDistributionCertificate
    -   iOSDistributionPassword
    -   iOSDistributionProvisioningProfile
-   MyAppSecrets
    -   AppCenterKey\_Android\_QA
    -   AppCenterKey\_Android\_Store
    -   AppCenterKey\_iOS\_QA
    -   AppCenterKey\_iOS\_Store

Again you will want to be sure that each variable group is allowing access to all pipelines otherwise the variables will not be available for the build you will setup next.

### Variable Group Take Aways

-   Android app signing is very different than for iOS. There is no need to track separate keystores for QA and Production.
-   iOS App Signing is very dependent on how to intend to consume the app. If you plan on side loading the app outside the App Store/Test Flight you will need a Development certificate. If you're ok with doing QA through Test Flight it may be worth it to simplify and use a single production certificate. That said you should change variables used such as where analytics are tracked, backend etc so you should be careful not to release QA builds into the wild where a customer could potentially use it.
-   You should have processes in place that ensure there is some manual validation that can occur before your app ends up on the Store.
-   You should also separate where Analytics/Crash Diagnostics are going between Stage and Production. While App Center is rather horrible at this currently, creating separate apps in App Center to track different environments can be a helpful technique in easily identifying Development noise verses what your customers are really doing and experiencing.
-   You are building the iOS and Android apps in more than one step. There is no reason to leak the Android app secret in the iOS build or lead the iOS app secret in the Android build... just provide the one you need at build.

## Next Steps

In the next post we'll look at how we integrate all of this into a build using YAML and how we organize it.
