---
title: "Prism for .NET MAUI - Public Beta"
description: "Ok the name kind of gives it away, but Prism for .NET MAUI is now available as a Public Beta! We've been working hard the past year on Prism for .NET MAUI, and..."
publishedAt: "2022-06-02T07:22:00.000Z"
updatedAt: "2022-06-02T16:05:56.000Z"
categories: [".NET",".NET MAUI","Prism","Xamarin"]
tags: ["Prism","maui","Xamarin Forms",".NET",".net maui"]
legacyUrl: "/post/2022/06/02/prism-for-net-maui-public-beta"
heroImage: "/images/blog/prism-for-net-maui-public-beta/01-image.webp"
draft: false
---
Ok the name kind of gives it away, but Prism for .NET MAUI is now available as a Public Beta! We've been working hard the past year on Prism for .NET MAUI, and at times it felt almost impossible as every time I would catch up with the MAUI team there would be new breaking changes that made it all pointless... The great news is that .NET MAUI has finally reached a certain level of API stability and we've been able to make some incredible process along the way. You might be asking, "Isn't this really just Prism for Xamarin.Forms but built against .NET MAUI?"

The answer to that is a little complex, but in short the answer is Yes... and No... The Prism.Maui initiative started with the Prism.Forms codebase and then over the past year we've made one improvement after another really in one of two categories:

1) .NET MAUI had a change in API or Paradigm that required a change in how Prism handles "...."

2) Prism.Forms was great but we really wish that we could have made "...." change

![Prism for .NET MAUI - Public Beta](/images/blog/prism-for-net-maui-public-beta/01-image.webp)

## Application Startup

One of the first things that you'll notice when you create a new .NET MAUI project is that you no longer have multiple Platform Heads with a common core project that contains your shared business logic. Single Project is here and it really cleans some things up. With Single Project we also get the MauiAppBuilder which is modeled after the App Builder pattern we've seen across the .NET Ecosystem from Console Apps to AspNetCore. This change is rather significant for developers coming from Prism.Forms as it moves the App Startup Logic outside of the PrismApplication and into the new PrismAppBuilder. One of the great things about the AppBuilder is that you get the opportunity to easily see what configuration options Prism offers and even get a few overloads to match what you need to do. In fact this gives you the opportunity to even write your own extension methods for the PrismAppBuilder as you can potentially call methods on the App Builder multiple times allowing you to split up your logic around what you might need to Register or Initialize. 

```csharp
// It's as easy as...
MauiApp.CreateBuilder()
    .UsePrismApp<App>(prism =>
        prism.RegisterTypes(c => {
            // register your types
        })
        .OnAppStart("MainPage"))
        .Build();

// Or take control of your navigation
MauiApp.CreateBuilder()
    .UsePrismApp<App>(prism =>
        prism.RegisterTypes(c => {
            // register your types
        })
        .OnAppStart(async (container, navigationService) => {
            var result = await navigationService.NavigateAsyc("MainPage");
            if(!result.Success)
            {
                // use the container to resolve a logger
            }
        })
        .Build();
```

The `PrismAppBuilder` doesn't stop there though as we also make it easier to maintain a fluent API and try to meet you where you want to be. This means that instead of having to access the `ILoggingBuilder` or `IServiceCollection` off of the `MauiAppBuilder`, we give you easy to use extensions to provide your delegate. Not only did we do that, but we also made sure that if you need to use the `IServiceCollection` to register your services, you can easily access the same registration methods to register your Views for Navigation with the IServiceCollection.

### Service Registration

For years Prism simply relied on 3rd party DI Containers. Due to issues surrounding different APIs with different containers, we began creating a robust container Abstraction layer that was powerful enough for most power users without needing to directly use the underlying container. We're rather proud of what this has unlocked for many developers. MAUI though brings Microsoft.Extensions.DependencyInjection into the Application Framework as a First Class citizen for the first time. While the Prism DI Abstraction layer isn't going anywhere, we did feel it was important to support both IContainerRegistry and IServiceCollection for registering your services.   
  
**NOTE:** Prism does not at this time directly support Microsoft.Extensions.DependencyInjection. There are limitations of the container which currently make it incompatible with Prism.

## Navigation

Over the years I've been incredibly blessed to travel to some amazing places and meet developers around the world. Without a doubt no matter where I go, everyone's favorite feature is Prism's awesome URI based Navigation for Prism.Forms. This was something that had to just work, but I also knew there was some room for improvement here as well. One of the first things was that the interface was cleaned up exposing only 3 methods with everything else being an extension method.

### ViewModelLocator

Prism has long had an Attached Property from the ViewModelLocator which allows you to optionally provide a boolean to Autowire the ViewModel. In early versions of Prism 6 this was required, however it was later made a Nullable Boolean with an assumption that if you had not set the property you probably wanted to Autowire the ViewModel. Prism.Maui changes this ever so slightly by introducing a ViewModelLocatorBehavior enum. You can either leave it Automatic and Prism will Autowire the ViewModel once the View is ready, or you can disable it entirely. It's important to note that if Prism detects that your View has a Binding Context that isn't itself or a Parent we will not Autowire your ViewModel.

### Navigation Builder

The Navigation Builder is brand new for Prism.Maui and something I think you'll really love. It is easy to use as an extension method on the INavigationService. The Navigation Builder has a number of helper methods to help you create complex Navigation URI's which can include parameters that are specific to individual Pages in your route, add a NavigationPage, or build a custom TabbedPage on the fly. Of course that's probably all things you've come to expect from Prism. For years I've often had developers request one thing over and over again with Navigation. They know that they shouldn't reference the View from the ViewModel as this breaks the MVVM pattern, and Prism hadn't offered ViewModel Navigation. This is something that you can now do with the NavigationBuilder.

```csharp
navigationService.CreateBuilder()
    .AddNavigationSegment("ViewA") // use classic names
    .AddNavigationSegment<ViewBViewModel>() // use ViewModel First API
```

### Overloaded Registrations

Prism's classic `ViewModelLocationProvider` has long had a limitation where a Single View can only be registered against a single ViewModel. This was something that I set out to solve with Prism.Maui. As a result, Prism.Maui is the first platform from Prism to support Registering a single View with different names each mapped to a different ViewModel. This will unlock so many possibilities particularly in the Enterprise and I'm excited to hear how this helps some of you create some incredible experiences.

```csharp
container.RegisterForNavigation<BillingPage, MonthlyBillingViewModel>("MonthlyBilling");
container.RegisterForNavigation<BillingPage, SubscriptionsViewModel>("Subscriptions");
```

### Global Navigation Events

One of the frustrations with the Navigation Service is that it has to be tied to a specific Page for context of where it will need to Navigate from. Over the years this has been transformed from a Transient to a Scoped Service which opens up a lot of possibilities when it comes to sharing the instance across types which may be resolved at different times such as the View, ViewModel, or even ViewModel for a Region within the Page. It also makes it harder to wire up a single handler to try to track the actual navigation stack or handle Navigation Errors. Prism.Maui has introduced a `NavigationRequestEvent` using Prism's tried and trusted `IEventAggregator`. You can hook up to this out of the box, or install the Prism.Maui.Rx package and get access to an `IObservable<NavigationRequestContext>` as part of the PrismAppBuilder pipeline.

```csharp
MauiApp.CreateBuilder()
    .UsePrismApp<App>(prism =>
        prism.RegisterTypes(c => { })
            .AddGlobalNavigationObserver(x=>
                x.Subscribe(context => {
                    // Check for Navigation Errors
                    // Update a local context for your current Navigation Uri
                })
            ));
```

## Region Navigation

It might seem odd to some, certainly it always has to me. Regions ARE how you navigate with Prism.WPF, and this was missing API for a very long time from Prism.Forms. When we finally did offer it, it was in a separate package. Region Support in Prism.Maui is built in from the start and its really first class as a result. A lot of work has been given to ensure that Scoped Services such as the INavigationService will be injected into your Region Views and ViewModels the same as they are in the parent Page's ViewModel. In fact if you Register a View with a Region and it is an Active View within the Region, the Region's ViewModel can even participate in classic Prism Navigation ViewModels getting the INavigationParameters for the Initialize, OnNavigatedFrom, OnNavigatedTo, and even Page Lifecycle events with Prism's IPageLifecycleAware interface.

## F.A.Q

Q. Is this Production Ready?  
A. In general I would say anything serious with MAUI should wait for .NET 7. This is absolutely great for POCs.  
  
Q. Is Prism.Maui API complete?  
A. No, it's probably about 90%+ but we are still missing a few things like our XAML Navigation Extensions, & the newer Dialog Service  
  
Q. Do I have to register my services with Prism's IContainerRegistry?  
A. NO! You can choose whether to use IContainerRegistry or IServiceCollection... and ultimately you can use both if its easier for you.  
  
Q. There is a flash of the Splash Screen when I do an Absolute Navigation. Is this normal? Will it be fixed?  
A. Yes that is due to a known bug in .NET MAUI. Hopefully it will be fixed and we won't have to hack to make Absolute Navigation work in the near future.  
  
Q. Is the API likely to change?  
A. It's matured quite a bit, but I do think we're mostly stable. It is still a beta package so things could still change.  
  
Q. Will there be a Template?  
A. Yes there will be... but as of this post there currently is not one. It is coming though and soon!

## Where To Get It

The public beta is available now on [nuget.org](https://www.nuget.org/packages?q=prism.maui). For those who have stepped up as a GitHub sponsor you can access the latest CI packages on [Sponsor Connect](https://sponsorconnect.dev/).

Please help keep Prism a sustainable Open Source project and [become a GitHub Sponsor](https://xam.dev/sponsorDan) today.
