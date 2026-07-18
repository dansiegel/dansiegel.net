---
title: "Azure Active Directory B2C for Xamarin Applications"
description: "You may have heard about Azure Active Directory B2C before. There have been a number of posts on the topic previously, including an episode with Matthew Soucoup..."
publishedAt: "2018-07-18T04:53:00.000Z"
updatedAt: "2018-07-18T15:33:40.000Z"
categories: ["Xamarin"]
tags: ["Xamarin","Azure Active Directory B2C"]
legacyUrl: "/post/2018/07/18/azure-active-directory-b2c-for-xamarin-applications"
heroImage: "/images/blog/azure-active-directory-b2c-for-xamarin-applications/01-image.webp"
draft: false
---
You may have heard about Azure Active Directory B2C before. There have been a number of posts on the topic previously, including an episode with Matthew Soucoup on the [Xamarin Show](https://channel9.msdn.com/Shows/XamarinShow/Azure-Active-Directory-B2C-Authentication-For-Mobile-with-Matthew-Soucoup). So why yet another blog post? Well to be honest the documentation can be a little confusing, and there is more to the setup of a tenant than you may have read about. There is absolutely nothing difficult about it in any way. However if you miss some critical configuration steps you'll struggle to ever authenticate with Azure Active Directory.

## Why Azure Active Directory B2C

Well for starters most of our apps today need some sort of authentication. There is a huge liability with storing user credentials, so while you might be able to use an OSS solution to implement your own OAuth flow, you're now taking the direct responsibility for properly maintaining the security of your users. If you're a large Enterprise that may not be a huge problem for you. For the rest of us (and even those large Enterprises), there is is a lot of benefit in offloading these tasks to 3rd parties like Microsoft. Not to mention that with the B2C offering we can further push off the responsibility to a number of common OAuth providers like Facebook, Twitter, LinkedIn, Google, etc.... and by checking a box you can enable 2-Factor authentication.

Ultimately what this means is that remove identifying user information from your own database storing only the Active Directory ObjectId for the user in your own database making breaches inherently less damaging as there is nothing more than a Guid in your database.

Beyond the security topic, cost is also important, particularly to a small business. While some of my larger clients have had projected user bases that may be in the hundreds of thousands or millions, for the vast majority of my clients Azure Active Directory B2C represents an Enterprise Grade OAuth service that will cost them absolutely NOTHING as their realistic projected user base ranges from a couple of users to less than 5,000. Since Azure Active Directory B2C gives you 50,000 users and 50,000 authentications per month for free, this results in the service being 100% free for them to use.

## Basic Concepts

It is important to remember the Azure Active Directory B2C is built on top of Azure Active Directory. This means that you do not have some magical new offering from Microsoft, but an existing, trusted, enterprise grade offering with some extensions that make a Business offering suitable to use directly with your Customers. This also means that IAM for your staff is handled through standard Active Directory user groups. 

Azure Active Directory / B2C both follow some basic OAuth concepts. Among these concepts is that you may have 1 - \* Client Applications that are authenticating with the service. It can be a little confusing and this is probably where you're likely to go wrong in the configuration (more on that in a minute).

Working with Azure Active Directory B2C might be a little confusing for Xamarin developers who are looking for that Native approach. Since we are working with an OAuth service we are forced to use a web view to actually authenticate. This means you cannot create that fully native view that makes a rest call as the user will have to Register or Login using the web view from the MSAL library. 

## Configuring the Application in Azure

When you first open your B2C tenant you should see something like the following (be sure to grab the tenant name circled as you will need it later for your Xamarin app):

![Azure Active Directory B2C for Xamarin Applications](/images/blog/azure-active-directory-b2c-for-xamarin-applications/01-image.webp)

You'll need to begin by setting up an application. While there is no specific requirement that you set up more than one, my personal preference is to secure each application with it's own Application Id and limit what it has access to. For the purposes of this post I'll be setting up two applications, one for the Web API, and one for the Mobile App. It's worth noting here that this configuration is going to be a lot of back and forth as we set things up.

![Azure Active Directory B2C for Xamarin Applications](/images/blog/azure-active-directory-b2c-for-xamarin-applications/02-image.webp)

We'll begin by adding a new Web API  application. To start we'll give this the name Awesome API, because let's face it... it's awesome. Then be sure to add a Reply URL. For now we'll add a localhost, this can be updated later. Next be sure to completely ignore the horribly wrong `optional` comment for the App ID... it's not... For this we'll give it the ID **api**.

![Azure Active Directory B2C for Xamarin Applications](/images/blog/azure-active-directory-b2c-for-xamarin-applications/03-image.webp)

Now let's add an application for our Mobile App. Since this is for our mobile app, we just want the Native Client.....

![Azure Active Directory B2C for Xamarin Applications](/images/blog/azure-active-directory-b2c-for-xamarin-applications/04-image.webp)

Ok, I lied... so this is one of the things that isn't very obvious, but in order to be able to add scopes (which we'll need in our app), we actually have to enable the Web App / Web API section. Remember I said earlier to ignore the complete lie that App ID is optional. If we don't set the App Id we won't be able to add a scope, and we can't actually do that unless Web App / Web API is enabled.

**IMPORTANT:** After you've created the application for the Mobile app, be sure to open it back up, copy the Application Id, and set the Custom Redirect URI, under the Native Client. The Redirect URI will always be:

**msal{Your Application Id}://auth**

![Azure Active Directory B2C for Xamarin Applications](/images/blog/azure-active-directory-b2c-for-xamarin-applications/05-image.webp)

Now both of our applications have a basic configuration, we can go into the applications and set up the scopes. You'll see by default we have the user\_impersonation scope. This is apparently used for the Microsoft Graph, and we'll want to set up our own scope. I personally haven't seen any documentation on right or wrong scopes, but as I understand it we actually will want to at least add a read scope here for our applications.

![Azure Active Directory B2C for Xamarin Applications](/images/blog/azure-active-directory-b2c-for-xamarin-applications/06-image.webp)

With our scopes set in both applications, we can now take a look at the API Access, and here is one of those areas where again things aren't really obvious.

![Azure Active Directory B2C for Xamarin Applications](/images/blog/azure-active-directory-b2c-for-xamarin-applications/07-image.webp)

You might be thinking as I did, that your application has permission to talk to itself... because why wouldn't it, right? Well it actually doesn't unless you add permission for each application to have access to itself under API Access. What happens if you skip this step? Well for starters you won't get an Access Token, and then what is the point of using Azure Active Directory B2C because you went through a bunch of setup to not have a token...

![Azure Active Directory B2C for Xamarin Applications](/images/blog/azure-active-directory-b2c-for-xamarin-applications/08-image.webp)

Finally for the Mobile App, be sure to add both the Mobile App itself with all permitted scopes, and the Web Api with all permitted scopes. When you're done, it should look something like this.

![Azure Active Directory B2C for Xamarin Applications](/images/blog/azure-active-directory-b2c-for-xamarin-applications/09-image.webp)

## Adding a Policy

Earlier I mentioned that you will be using a Web View from the MSAL library to work with your B2C tenant. The way that this is exposed is with Policies. At the time of this article there are currently 6 policies that you can configure. These are fairly straight forward. To start, you'll likely want to add a policy to allow users to either Sign Up or Sign In. You can alternatively separate these tasks so that in your underlying UI you have separate Login and Register buttons with each one bringing you to a UI from B2C that makes sense for that work flow. If you have configured any Identity Providers (not covered by this article), you will be able to choose whether to use those and/or the local account. 

## Setting up the Xamarin App

To use Azure Active Directory or Azure Active Directory B2C in your Xamarin or Xamarin Forms application you will need to install the [Microsoft.Identity.Client](https://www.nuget.org/packages/Microsoft.Identity.Client/) (which is still only available as a preview package on NuGet). There is actually fairly decent setup instructions for considerations you'll want to have setting up the client in your Xamarin iOS and Android applications in the official sample app on [GitHub](https://github.com/Azure-Samples/active-directory-b2c-xamarin-native). While I would hardly consider the sample anywhere close to demonstrating best practices as it fully exposes the Tenant and Application Id in source control, not to mention I am very much against static references, I will say it is a great sample to validating that you have correctly configured your new B2C Tenant. 

Going back into the Azure portal grab the Application Id for the Mobile App, along with the tenant name from the first step. Finally grab the read scope from the mobile app. If you're using the Azure sample app, you just need to update these couple of fields and run the app. If you put a break point in the MainPage.xaml.cs after the call to `AcquireTokenAsync` you should be able to evaluate the AuthenticationResult and see both an IdentityToken and AccessToken along with the expiration. If you see both, your tenant is correctly configured and you can now use Azure Active Directory B2C to correctly authenticate.
