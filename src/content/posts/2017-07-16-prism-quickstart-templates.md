---
title: "Prism Quickstart Templates"
description: "Quickstart Templates for Prism Forms So you had this great idea for an app... maybe you spent weeks planning with your team or with your client. The day finally..."
publishedAt: "2017-07-16T07:44:00.000Z"
updatedAt: "2017-08-05T13:02:59.000Z"
categories: [".NET","Prism","Xamarin"]
tags: ["Xamarin Forms","Prism","C#","MVVM"]
legacyUrl: "/post/2017/07/16/prism-quickstart-templates"
draft: false
---
## Quickstart Templates for Prism Forms

So you had this great idea for an app... maybe you spent weeks planning with your team or with your client. The day finally comes to create the project. Suddenly you realize that we have this new .NET Standard thing and you want to take advantage of that too. You remember you need icons, you want a Splash Screen... all of the things that go into making an App. For anyone who has done this, you know there's a lot of heavy lifting to be done. In all honesty you could easily spend several days just getting a new project from File -> New to something that you're ready to start working on.

It was for this and so many other reasons that I realized we need better templates, and we need something that can help us whether we're on a Mac or on PC.

There are some very basic things left out of the base Xamarin & Prism Templates. For some developers these just require time that could be better spent on something else, and for other developers it leads them down a path of poor design.

## Features

Why should you use these templates? Well here are a couple bullet points:

-   Gets you off the ground following Best Practices
-   \*Starts you off using Prism for Xamarin Forms with either DryIoc or Unity for Dependency Injection
-   Already has all of your App Icons added so all you need to do is drop in the replacement files from File Explorer or Finder. There is also a link in there so you can see how to get all of your icons generated for you correctly in all of the sizes with all of the correct naming.
-   Starts you off with some base colors to use for your project with information of how to develop a Material Design pallet for your application.
-   By default it already has everything you need for Localizing strings in XAML
-   It's cross platform, using `dotnet new` you get the same experience from the command line whether on Mac or PC.
-   Item templates to generate Views and ViewModels with support for the common Xamarin Forms pages as well as PopupPages
-   Makes it easier to inject variables at Build to protect sensitive project secrets.
-   Quickstart with a fully working Todo app working with in memory data, Realm, or Azure Mobile Client
-   Included config for [MFractor](https://www.mfractor.com/products/mfractor-for-visual-studio-mac)

\*NOTE: Autofac & Ninject will be reintroduced once Prism 7 has a public preview.

### Best Practices

App development can be simultaneously fun and frustrating. So many developers love Xamarin Forms because it really narrows down the number of API's you need to work with. What it doesn't do is eliminate your need to understand the platform your application will run on. These templates will not eliminate that need either, however they do set you down the right path, with some basic things like a splash screen so your user will at least see something while your app loads. Also included by default is the MVVM Helpers library from James Montemagno so that you can use his `ObservableRangeCollection<T>` to reduce the notifications sent to the UI when updating or replacing multiple items in your collection. If you don't use it MVVM Helpers you still get a `ViewModelBase` that will incorporate these properties as well as well as `IDeviceService` and virtual implementations of `INavigationAware`, `IActiveAware`, and `IApplicationLifecycle`.

### Prism

Continuing really with Best Practices, these templates use Prism for Xamarin Forms. Currently the templates support DryIoc and Unity for Dependency Injection. Autofac and Ninject will be added back in once there is a publicly available release of Prism 7.

#### TabbedPages

Working with TabbedPages has traditionally been one of the more challenging areas of working with Prism. With the QuickStart template this challenge disappears. The template includes two base implementations for a TabbedPage, the `PrismTabbedPage` and the `DynamicTabbedPage`. If your TabbedPage inherits from PrismTabbedPage, it will automatically pick up and pass on the NavigationParameters to the Child Pages allowing you to properly initialize them. If you use the DynamicTabbedPage you only need to reference it in your Navigation URI and pass in variables like:

```csharp
NavigationService.NavigateAsync("TabbedPage?tab=ViewA&tab=ViewB&tab=ViewC");
```

But it actually gets a little better than that because not only does it pick up tabs but you can also do some deep linking like:

```csharp
NavigationService.NavigateAsync("TabbedPage?tab=NavigationPage/ViewA/ViewD&tab=NavigationPage/ViewB&tab=ViewC");
```

This means you can actually support scenarios where your actual tabs contain their own NavigationStack independent of the rest of the application.

### App Icons

Applications need a lot of icons and really the templates out there don't do a very good job with App Icons. Most templates out there just leave your deployed app with a broken icon image and require some time getting the icons setup. These templates start you off with icons for your Android and iOS projects. But more than that is the GettingStarted document included in the template gives you the information you need to be able to quickly and efficiently generate a full icon set that you can drop in to replace the default icons with your own icons. Following along with Best Practices, you'll find that the iOS project is using the newer appiconset approach with the app icons as ImageAssets rather than having them in the Resources folder as BundleResources. Similarly on Android you'll find the app icon's are all in the mipmap folders rather than drawable.

### Material Design

While my purpose is not to teach Material Design, there are some basics that we can easily include in the template to get you started down the right path. That includes a basic color pallet with information of how to choose new colors. There is also already a Style defined for you to customize the look and feel of a NavigationPage using those colors.

### Localization

One of the things I hear over and over, developers in the United States forget some people don't speak English. For most US based dev's Localization is a complete and total afterthought. Interestingly nobody seems to have thought previously that maybe we should provide a template that assumes you want your application easily consumable by people in another country who speak another language. The quickstart template comes complete with all of the helper classes you need to get Localization working in the application and gets the Localization implemented with the DI container using Prism's `IPlatformInitializer`. There is also a XAML extension provided so all you need to do is include the namespace in your XAML file and use it as needed. The app of course also includes a single Resx file to get you started. You simply need to add the string resources you want to use in your application.

### Cross Platform

It might seem weird when we're talking about Xamarin, but seriously it gets frustrating when we're working with a Cross Platform technology and then the developer experience is completely and totally different depending on which platform you are on. One of the most common issues we can see from a templating standpoint is that if I click `File -> New`, it shouldn't matter whether I'm on Mac or PC, I should be able to decide if I want my project to include iOS, Android, UWP. That's not to say I don't understand that some time may be needed before you can build a UWP app on Mac, but you should at least be able to have the platform as an option so you can work on the codebase from either platform.

### Item Templates

Also included are some Item Templates custom built for the included project templates. There are two basic types of Item Templates, Pages and Services. Note that there is currently no way for the dotnet templating engine to pick up what your base namespace is, so you do have to specify this from the command line.

#### Pages

By default when you call `dotnet new prismitem` you will get a page. It's assumed that you're using the ViewModelBase from the included Project templates. You can add flags to specify whether you want to implement `INavigatingAware`, `INavigatedAware`, `INavigationAware`, `IActiveAware`, or `IDestructible`. By default it implements `INavigationAware`. There is also a flag to indicate if the page is a Tabbed Child which will automatically implement `IActiveAware` and `INavigatingAware`. Currently supported page types include ContentPage, MasterDetailPage, TabbedPage (which inherits from the Quickstart PrismTabbedPage), and PopupPages.

_Samples_

```bash
dotnet new prismitem -namespace MyAwesomeApp -n LoginPage
dotnet new prismitem -namespace MyAwesomeApp -page PopupPage -n SomePage
dotnet new prismitem -namespace MyAwesomeApp -n CustomerDetailPage -child
```

#### Services

Chances are your app is probably using some sort of service and if you like testability like I do, then you'll really appreciate that you can create a service with Mock class that will automatically be picked up by the Quickstart template simply by building with the Mock configuration. 

_Samples_

```bash
dotnet new prismitem -item Service -namespace MyAwesomeApp -n LoginService
dotnet new prismitem -item Service -namespace MyAwesomeApp -n LoginService -mocks false
```

### Secrets

All apps have secrets and other variables that we just don't want checked into source control. To better assist with this, the template includes some helpers that will regenerate the `Secrets.cs` with sensitive variables you want in your codebase. Both the `Secrets.cs` and `secrets.json` files have also been added to the included `.gitignore`, so you can finally develop apps without having to tackle the issue of keeping app secrets out of SCM.

_secrets.json_

```js
{
  "AuthClientId": "{Your App Client Id}",
  "AppServiceEndpoint": "https://appservicename.azurewebsites.net/"
}
```

_Secrets.cs_

```csharp
namespace YourProject.Helpers
{
    internal static class Secrets
    {
        internal const string AuthClientId = "{Your App Client Id}";

        internal const string AppServiceEndpoint = "https://appservicename.azurewebsites.net/";
    }
}
```

### PropertyChanged.Fody

Part of the MVVM pattern is working with `INotifyPropertyChanged`. Unfortunately the code can get a bit tedious. 

```csharp
public class ViewAViewModel : BindableBase
{
    private string _title;
    public string Title
    {
        get => _title;
        set => SetProperty(ref _title, value);
    }

    private MyModel _selectedItem;
    public MyModel SelectedItem
    {
        get => _selectedItem;
        set => SetProperty(ref _selectedItem, value, onChanged: OnSelectedItemChanged);
    }

    private void OnSelectedItemChanged()
    {
        // Do Stuff
    }
}
```

With PropertyChanged.Fody already included our ViewModels and other Observable objects simply become:

```csharp
public class ViewAViewModel : BindableBase
{
    public string Title { get; set; }

    public MyModel SelectedItem { get; set; }

    private void OnSelectedItemChanged()
    {
        // Do Stuff
    }
}
```

### Mobile Center

Also bundled into this template is support for the Azure Mobile Center. While this is an opt in feature you can pass in your App Secret for iOS and/or Android from the command line with everything already wired up to send your analytics and crash data to the Azure Mobile Center. This includes an implementation of `ILoggerFacade` that will create a Mobile Center Analytics Event.

### Data Providers

Apps today are so often really connected apps. The Quickstart Template provides you a fully functional TodoApp with the option to use either the Azure Mobile Apps Client with [AzureMobileClient.Helpers](/post/2017/05/23/azure-mobile-client-helpers) or to use Realm. Either data provider will start you out with the ability to quickly develop your app with full online/offline sync with the bare minimum of configuration. 

#### Azure Mobile Client

In addition to simply using the Azure Mobile Client you can additionally decide if you want to use anonymous authentication or if you will require some sort of authentication. If you choose an authentication provider, the Quickstart will provide you base classes for everything you need to get started. This includes scaffolding for custom authentication sources and a fully working implementation for Azure Active Directory B2C with support coming for AAD, Google, Facebook and Microsoft Accounts.

### Plugins

Because the full working app uses a PopupPage for the TodoItem detail page, the Quickstart includes [Prism.Plugin.Popups](https://github.com/dansiegel/Prism.Plugin.Popups), and also optionally includes a [Barcode Scanning Service](https://github.com/dansiegel/BarcodeScanner) utilizing [ZXing.Net.Mobile](https://github.com/Redth/ZXing.Net.Mobile) and is fully registered and configured.

### Getting Started

To get started with the templates it's recommended that you install version [2.0 pre3 of the dotnet cli](https://github.com/dotnet/cli/tree/release/2.0.0) as this contains several fixes in the templating engine. Once that is installed you can install the templates by using the following commands in your cli.

```bash
dotnet new -i "Prism.Forms.QuickstartTemplates::*"
```

You should see the `prismitems` and `prismformsempty` templates. The Quickstart template is grouped with the empty template, though you may not see it listed it is still there.

```bash
# See the Help and options for the Quickstart Template
dotnet new prismforms -h

#Create your first quickstart
mkdir Contoso.AwesomeApp
cd Contoso.AwesomeApp
dotnet new prismforms -id com.contoso.awesomeapp -fr netstandard1.6 -mc -ios-secret
     "{your ios secret}" -android-secret "{your android secret}" -data AzureMobileClient
     -auth AADB2C -client-id "{your AADB2C application id}"
#Be sure the B2CName in secrets.json matches your AAD B2C name
```
