---
title: "Using Dependency Injection Everywhere"
description: "Recently I started putting together some extensions to make my life even easier with Dependency Injection. I really enjoy being able to use Prism's abstractions...."
publishedAt: "2019-05-24T11:56:00.000Z"
updatedAt: "2019-08-15T08:10:46.000Z"
categories: ["Prism","Xamarin"]
tags: ["Dependency Injection","Prism","Xamarin Forms","Xamarin"]
legacyUrl: "/post/2019/05/24/using-dependency-injection-everywhere"
draft: false
---
Recently I started putting together some extensions to make my life even easier with Dependency Injection. I really enjoy being able to use Prism's abstractions. This means I can write code today without any regard for which actual container I may choose 6 months from now. If you've been following my [Twitch streams](https://twitch.tv/dansiegel) you may have seen me demo the Prism Container extensions. In talking with developers about them I realized it was about high time I wrote a blog post about what they are, and why you might want to use them.

## Advanced Service Registrations

For 95%+ of your service registrations you're probably fine with registering a Service as a Transient (you get a new instance every time) or a Singleton (you get the same instance wherever you need it). 

```csharp
containerRegistry.Register<IFoo, Foo>();
containerRegistry.RegisterSingleton<IBar, Bar>();
```

The truth though is that for real complex applications it isn't always that cut and dry. Sometimes you might want to have a single type that implements several services. While other times you might need to have some sort of Factory method to construct a new instance of your service, or still other times you may require some sort of Scoped Service. The Container Extensions provide a way that we can take these much more advanced concepts and utilize them as an addition to Prism without interfering with anything from the main Prism Library.

```csharp
protected override void RegisterTypes(IContainerRegistry containerRegistry)
{
    // Registers IFoo & IBar
    containerRegistry.RegisterMany<FooBar>();

    containerRegistry.RegisterSingleton<IFooBuilder, FooBuilder>();
    containerRegistry.RegisterDelegate<IFooBar>(BuildFooBar);
}

private static IFooBar BuildFooBar(IContainerProvider containerProvider)
{
    var foo = containerProvider.Resolve<IFooBuilder>();
    return foo.Build("Some value");
}
```

You may be wondering why not add this to Prism proper... who knows if there is enough support maybe it will be. But in the mean time this keeps the Prism codebase light weight with a more heavy duty API in a separate codebase.

## Using it Outside of Prism

So one of the neat things about this is that the only real dependency with Prism is Prism.Core which has a few side effects such as making the Container implementation for DryIoc completely platform agnostic, and making it easy to use outside of Prism. The PrismContainerExtension has a few other benefits:

-   It supports Splat
-   It implements IServiceProvider
-   It supports Microsoft.Dependency.Injection with an ability to create IServiceProvider from an IServiceCollection
    -    There's an additional support package for Shiny to make this even easier
-    PrismContainerExtension implements a Singleton pattern meaning you can initialize it in native code and continue to access the same container later from shared code

## Prism Forms Extended

Debugging can (though shouldn't) be hard. So how exactly does PrismApplication from the extended package make your life even easier? Well for starters we get global exception handling for:

-   AppDomain
-   TaskScheduler
-   ObjCRuntime
-   AndroidEnvironment

That's all pretty cool but that doesn't cover all of the errors we might encounter so we also get global handling for:

-   Module Load Errors
-   All Navigation Errors with the Navigation Uri, or the invoking method name (i.e. GoBackAsync, GoBackToRootAsync)

Now for as awesome as all of that is, it still doesn't cover one insanely important area... XAML! So for all of those times you've ever had an issue where a Binding wasn't working and you're looking at the UI with no clue where to begin, you'll get logging for FREE from Xamarin Forms Binding errors and more.

### Platform Specifics & Uri Navigation

Ok so Uri based navigation is nothing new in Prism, but perhaps one of the last problem children has been how do I use a Xamarin.Forms.TabbedPage dynamically from Prism **AND** set the title for when you need the TabbedPage in a NavigationPage. For those times you run into this situation and you want to simply pass title a title parameter to the TabbedPage you can now do that and have the Title bound. 

What's more is that the addition of IPageBehaviorFactoryOptions. With these options you have the ability to control several Platform Specifics globally.

```csharp
internal class DefaultPageBehaviorFactoryOptions : IPageBehaviorFactoryOptions
{
    public bool UseBottomTabs => true;

    public bool UseSafeArea => true;

    public bool UseChildTitle => true;

    public bool PreferLargeTitles => true;
}
```

## Shiny

I have to admit among my favorite new libraries of 2019 is [Shiny](https://github.com/shinyorg/shiny) from Allan Ritchie. It makes a lot of complex tasks stupidly simple and reliable. Interestingly about the time that Allan first told me about his new project coming into beta I had also just started to stabilize the Container Extensions. It was such a perfect fit that it took almost no work to integrate the two. For a traditional Prism Forms application this wouldn't be the case as you wouldn't easily be able to initialize your container, register what you need with the Microsoft.DependencyInjection.Extensions and then get that container ready to go inside of Prism Application. However because of the design of the Container Extension you can now simply base your ShinyStartup on the PrismStartup from the Shiny.Prism.DryIoc package and use the PrismApplication from the Prism.DryIoc.Forms.Extended package and you're done. It requires zero code changes to your existing Prism Application and your startup is simply:

```csharp
public class MyStartup : PrismStartup
{
    public override void ConfigureServices(IServiceCollection services)
    {
        // Register services with Shiny like:
        services.UseGps<MyDelegate>();
    }
}
```

## Next Steps

Be sure to try out the Prism.DryIoc.Forms.Extended package for your Xamarin.Forms app or Prism.DryIoc.Extensions in your Prism.Wpf app. Be sure to [follow me](https://twitch.tv/dansiegel) on Twitch to see when I go live or have new videos available on more great Prism and Xamarin Forms development topics. If you try it out be sure to tweet at me [@DanJSiegel](https://twitter.com/DanJSiegel) and let me know how you like it or if there's something you'd like to see.
