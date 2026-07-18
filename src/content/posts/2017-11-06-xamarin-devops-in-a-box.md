---
title: "Xamarin DevOps In A Box"
description: "Several Months ago I set out to make some of the most powerful Xamarin Project Templates. I've gotten a lot of feedback on the Prism QuickStart Templates and how..."
publishedAt: "2017-11-06T12:53:00.000Z"
updatedAt: "2017-11-15T21:27:00.000Z"
categories: ["Prism","Xamarin"]
tags: ["Xamarin","DevOps","Prism"]
legacyUrl: "/post/2017/11/06/xamarin-devops-in-a-box"
draft: false
---
Several Months ago I set out to make some of the most powerful Xamarin Project Templates. I've gotten a lot of feedback on the [Prism QuickStart Templates](/post/2017/07/16/prism-quickstart-templates) and how they have accelerated Mobile Development for Developers. One of the features that has really caught the attention of so many developers is the Application Secrets generation. Mobile Apps so often have sensitive information such as Client Id's, or builds that require some minor changes such as pointing to one backend API for Development, another for Staging, and yet another for Production. The custom tasks that have been included in the QuickStart Templates have been helping developers for months to more easily handle these tasks.

Over time as I've made changes and improvements I've come to realize that it has left existing projects in a state where they have been unable to take advantage of changes. There has also been the fact that while they have been tied exclusively to the Prism QuickStart Templates though there is nothing about these great Build Tasks that are tied in any way to Prism. These wonderful Build Props and Build Targets have been separated out into an easy to install NuGet. Since this only contains build props and targets it adds nothing to the size of assemblies, but it does make your DevOps a whole lot easier.

### Build Props

While many developers may not currently be utilizing many Build Props, the Mobile.BuildTools adds a number of properties that help you determine what type of project is building and on what type of Host. This could for example better assist you in developing Build tasks that only execute on Windows or Mac, determine if PowerShell is installed. You can also easily determine what platform the project is. We'll take a look at an example below.

### Build Secrets

Modern apps are full of Client Id's, and Secrets that it can be maddening for Security. After all how do you develop an app that requires this type of sensitive information without compromising security by checking code into Source Control that contains our Id's and Secrets? Better yet how can we develop better CI/CD pipelines that are customized for an environment such as Development, Staging, or Production? This is where the Secrets Task shines. By simply including a file named `secrets.json` in your project root, the Secrets Task will generate a Secrets class for you. This enables you to ignore both the `Secrets.cs` and `secrets.json` files in your .gitignore. This frees your Build Server to generate your secrets.json and the rest is handled for you.

### Templating Project Manifests

Sometimes our DevOps process requires having flexibility across our app manifests. While I am sure there are a multitude of reasons for why you might have this requirement the two most common use cases I see are:

-   I am developing an Application that must be tweaked for multiple customers and deployed to the App Store for each (i.e. a Banking App)
-   My application requires a setting in my manifest that exposes a Client ID or some other sensitive piece of information (i.e. I am using the Microsoft.Identity.Client for Azure Active Directory)

This is another area where the Mobile.BuildTools really shines by allowing you to include safe to check in Manifest Templates which will then be appropriately copied to your iOS or Android project. As I mentioned before this is just a sample of how the Build Props can better assist your DevOps. Each Copy task is restricted so that the AndroidManifest.xml is only copied when IsAndroidProject is true, and the Info.plist is only copied when IsiOSProject is true. 

### FAQ

Q. What happens if I don't have a secrets.json included in my Project?  
A. Nothing. The Task will safely execute, not having found a secrets.json file and will finish without creating anything.

Q. Can I name secrets.json something else?  
A. Yes, it is a configurable Property. You can add JsonSecretsFileName to the PropertyGroup of your Project with the file name it should look for.

Q. Can you have secrets in more than one Project?  
A. Yes, you can have secrets in as many projects as you want. Again the Task will only generate the Secrets class if you have a secrets.json present.

Q. The idea of a Tokenized Manifest sounds cool, but I don't need it. Can I still use the BuildTools?  
A. Yes! As long as the AndroidManifest.xml or Info.plist is present when the Build is started it will not copy them over. Otherwise it would get really annoying during development to get some Tokenized manifest constantly undoing your changes.

Q. How do I find out more about setting up the Manifest Templates? Is is customizable?  
A. You can find out more on [GitHub](https://github.com/dansiegel/Mobile.BuildTools). You can override the default variables to change the location of the templates, and even the Template Names. 

Q. Am I able to swap out the appxmanifest on UWP?   
A. UWP is not currently handled by default, however you can easily add support by adding `ManifestDestinationPath` and `TemplateManifestPath` to the PropertyGroup in your UWP Project.

Q. Does it work on with Visual Studio and Visual Studio for Mac?  
A. Yes it work on both Mac and Windows. As part of migrating this out of the templates, the tasks have been upgraded to compiled tasks meaning it works with MSBuild without any additional requirement for PowerShell.

### Getting Started

For existing QuickStart Template Projects, you will need to delete the Directory.build.props and Directory.build.targets. You can also delete the PowerShell scripts. To get started, simply install the [Mobile.BuildTools](https://www.nuget.org/packages/Mobile.BuildTools/) NuGet into any project you need to generate App Secrets or an iOS/Android project that you want to be able to swap out the Manifest for.
