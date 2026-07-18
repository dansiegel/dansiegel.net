---
title: "Shiny all the things - writing testable code"
description: "Shiny all the things as they say. If you aren't using Shiny for your Xamarin.Forms or Uno Platform apps, the question is why? We see a lot of people excited..."
publishedAt: "2021-03-12T08:30:00.000Z"
updatedAt: "2021-03-22T14:45:16.000Z"
categories: [".NET","Xamarin"]
tags: []
legacyUrl: "/post/2021/03/12/shiny-all-the-things-writing-testable-code"
heroImage: "/images/blog/shiny-all-the-things-writing-testable-code/01-image.webp"
draft: false
---
Shiny all the things as they say. If you aren't using Shiny for your Xamarin.Forms or Uno Platform apps, the question is why? We see a lot of people excited about UI libraries these days. While UI is always an important ingredient of any successful app, no app is complete without a resilient and testable architecture. This is one of the reasons why I use Shiny in all of my apps today. But what is Shiny, and why should you be using it?

![Shiny all the things - writing testable code](/images/blog/shiny-all-the-things-writing-testable-code/01-image.webp)

Before we can look at that it's perhaps important to look at that thing that so many people fail to do... test your apps. Writing loosely coupled code is an important concept to master if you ever hope to write testable code. Using Test Driven Development is an important concept to help ensure that you speed up the development loop, and eliminate bugs, particularly in your business logic early. When we use loosely coupled code, using design practices that are intentionally Testable, and marry that with Dependency Injection we end up with an app architecture that is powerful, lightweight and robust. But what is Shiny? Is it true that it has a lot of overlap with Xamarin.Essentials? Why is it better to use Shiny than Xamarin.Essentials? How does Shiny help us build apps with loosely coupled testable code?

These are all great questions. While no single blog post could ever hope to fully explain these things in detail, hopefully by the end of this one you have a better sense for how to use Shiny to improve your app, write less code, and perhaps most importantly write tests that help you achieve your goals.

### What Is Shiny?

Shiny is a collection of lightweight API's that help with common and specific requirements that many apps end up having to write complex solutions for. Between the Shiny Core and optional NuGet packages there are around 20 or so common things that Shiny will help with including Local Notifications, Push, Geofencing, GPS tracking, network Connectivity, foreground and background Jobs, and much more. By using Shiny you end up with lightweight, platform agnostic code that is written once instead of once for each target platform, and is ultimately easier to test.

### Is it true that Shiny has a lot of overlap with Xamarin.Essentials? Why is it Better?

I suppose this is all in the eye of the beholder. Shiny does indeed have some overlap, though both Xamarin.Essentials and Shiny have different goals and thus expose API's for different things. For example both have helpers that allow you to get things like the app Data directory or Cache directory path. Both have API's for determining the app's network connectivity state, and even Secure Storage. However Essentials will never try to deal with Bluetooth or Push notifications, while Shiny would never try to deal with Email, the WebAuthenticator, etc. 

But this really brings us to the next question, why is it "Better"? Ok better might be a little harsh, and in full transparency I do quite often use Xamarin.Essentials together with Shiny as you'll see when we cover testing. Seriously though, why is Shiny often "Better" to use over Essentials? To answer that, we have to look again at the testability. Xamarin.Essentials has always taken the approach of Static API's that are cross compiled using a NuGet packaging technique commonly referred to as "Bait and Switch". What this results in is theoretical gain in performance at the sub-millisecond level (we're talking extreme tech geek level looking at bytes taken up in memory). In practice there is no practical gain in performance. However by referencing Xamarin.Essentials particularly from shared code you permanently loose the ability to actually unit test your code as the result is that your Unit Tests (running say netcoreapp or full framework .net) end up with the bait and switched version of the dll that simply throws a NotImplementedException or PlatformNotSupportedException... not really useful for testing your code. Even if you are running unit tests with a device runner on iOS/Android, you still end up with the problem that you cannot mock the return values of Essentials thus negating your ability to validate how your own code say handles various values you might expect. To get around this, you could simply use Xamarin.Essentials.Interfaces a community package from Ryan Davis that is generated for each release of Xamarin.Essentials, however there are still other benefits to using Shiny.

Some of the notable benefits with Shiny is that it takes an interface first design approach. Additionally because Shiny uses Dependency Injection out of the box this means that you can instantly leverage what Shiny is doing and just simply inject the interfaces you require without having to register the interface / implementation or prevent the linker from stripping out the constructor of the implementation. Shiny additionally provides API's that are rich with an understanding of Reactive programming, providing you Observables over events which is much more powerful for scenarios like determining when the app is Online/Offline. For the sake of this article we won't go into that, but I would encourage you to learn more about Reactive programming if you have not already. Finally some of the API's such as Secure Storage are just easier to use, as we will see in a moment.

### How does Shiny help us to write loosely coupled, testable code?

This is perhaps one of my favorite additions to Shiny v2, and honestly a feature I've been bugging Allan for since before the world changed with Covid-19. Shiny had always supported a concept of "Settings". These were things that you could implement a class for and through a little DI magic from Shiny, your class was instantly a persistent data store that you could provide settings values to and access them from one launch of your app to the next. So how did this work?

```csharp
public interface IMyAppSettings
{
    string Username { get; set; }
}

public class MyAppSettings : ReactiveObject, IMyAppSettings
{
    [Reactive]
    public string Username { get; set; }
}
```

The first thing we're doing here is providing an interface that simply provides some setting like the Username of the user for the app. The interface is basic, it describes the properties we care about without any care in the world of the fact that we might be storing these values with some persistence. Next we implement this, and choose a base class that also implements INotifyPropertyChanged. For this example I'm using ReactiveUI's ReactiveObject, and adding the Reactive attribute to the property, because I'm lazy, and the ReactiveUI.Fody package will update at build with the actual getter and setter. Now in our Startup we simply can register this with the IServiceCollection calling AddSingleton and provide the interface and implementing class. Shiny does the rest ensuring that it is properly bound so that IMyAppSettings will persist from one launch to the next with our app.

You might also note here that this is quite different from using Preferences in Xamarin.Essentials, as our class is simply a normal class implementing INotifyPropertyChanged. There is literally nothing special about it.

This is great but sometimes we might want to protect the setting. An example of this could be with the user's session token that we'll use to authenticate with our app's API. We might normally want to use the platform Secure Storage, but using something like this with Xamarin.Essentials would be difficult to implement as easily. For starters Xamarin.Essentials exposes this with an async API which doesn't mesh well with binding to Getters and Setters. There is technically a reason for this, and one that to be transparent doesn't work well for those targeting UWP in particular. As a result the Secure Store isn't supported by Shiny on UWP (but you could write your own provider and submit a PR to Shiny), however if you're targeting iOS, watchOS, tvOS, macOS, or Android this will work for you. So how do we do this with Shiny v2? The answer is with a completely re-architected concept of Settings to Stores. This allows us to similarly bind our implementation like we did with Settings in v1, but now we can choose a specific Store for Shiny. Let's look at how we might do this with Shiny v2.

```csharp
public interface ISessionStore
{
    string Token { get; set; }
}

[ObjectStoreBinder("secure")]
public class SessionStore : ReactiveUI, ISessionStore
{
    [Reactive]
    public string Token { get; set; }
}
```

Just like with Settings from Shiny v1, we setup our interface and implementing class. Where it changes ever so slightly, is that by adding the ObjectStoreBinder attribute to our implementation and specifying the `secure` store Shiny will now transparently bind this to the SecureKeyValueStore when we register this with Shiny like:

```csharp
public override void ConfigureServices(IServiceCollection services, IPlatform platform)
{
    services.AddSingleton<ISessionStore, SessionStore>();
}
```

### How this helps us write tests and be more productive?

"Test driven development", it's one of those phrases that we have all heard, but all too often fail to do. If you've been around the Mobile Development world for more than 5 minutes you've probably figured out that it can take significantly more time to build for your device than to simply build a netstandard or netcoreapp project. Since our code is generally in a netstandard project and our tests are likely a netcoreapp this means that when we're writing tests we can much more rapidly build and execute tests to validate that our business logic is executing as expected. For the purposes of this post, I will be showing some code examples with xunit, but any test framework is fine. I will also be showing this using Moq, which is another fantastic Open Source library for helping you write unit tests that I encourage you to learn more about.

Now let's assume that we have an Authentication Service that will need to use the SessionStore we created earlier. The Authentication Service has a Login method, and will use the WebAuthenticator from Xamarn.Essentials. Remember we want our code to remain testable so we instead need to reference Xamarin.Essentials.Interfaces and inject IWebAuthenticator instead of calling the WebAuthenticator directly. Our Authentication Service might look like:

```csharp
public class AuthenticationService : IAuthenticationService
{
    private ISessionStore _sessionStore { get; }
    private IWebAuthenticator _webAuthenticator { get; }
    private IAuthenticationConfiguration _authConfig { get; }

    public AuthenticationService(ISessionStore sessionStore, IWebAuthenticator webAuthenticator, IAuthenticationConfiguration authConfig)
    {
        _sessionStore = sessionStore;
        _webAuthenticator = webAuthenticator;
        _authConfig = authConfig;
    }

    public async Task<bool> Login()
    {
        if (!string.IsNullOrEmpty(_sessionStore.Token))
        {
            // We might also want to validate the session hasn't expired...
            return true;
        }

        var result = await _webAuthenticator.AuthenticateAsync(
            _authConfig.AuthUrl,
            _authConfig.CallbackUrl);

        _sessionStore.Token = result.AccessToken;
        return !string.IsNullOrEmpty(_sessionStore.Token);
    }
}
```

Now when we go to test this there might be a few things we want to validate. Because this is using an interface instead of the WebAuthenticator explicitly, we now have the ability to leverage the Moq library to create a mock implementation that can provide callbacks into our code, and even allow us to simulate different responses, or even exceptions such as the TaskCancelledException. Let's get started with our first test. For this we want to validate that when we have a token our Login method will immediately return a true value and not call the WebAuthenticator.

```csharp
[Fact]
public async Task DoesNotCallWebAuthenticatorWithValidToken()
{
    var store = new SessionStore
    {
        Token = "SampleToken"
    };

    var wasCalled = false;
    var webAuthMock = new Mock<IWebAuthenticator>();
    webAuthMock.Setup(x => x.Login())
        .Callback(() => wasCalled = true)
        .ReturnsAsync(new WebAuthenticatorResult());

    var authService = new AuthenticationService(store, webAuthMock.Object, Mock.Of<IAuthenticationConfiguration>());

    Assert.True(await authService.Login());
    Assert.False(wasCalled);
}
```

You will notice that we can write a very clean test to continually validate that our AuthenticationService is ONLY calling the WebAuthenticator when we need. We've done with without any single reference to Secure Storage. While the Secure Storage may be a business requirement this is done in a loosely coupled way that does not impact or complicate our test in any shape way or form. Additionally because we're are creating our test cases here we can rapidly see if a change in code breaks our business logic, we can debug the test, and do so at a much faster pace than build, launch and stepping through out app just to hit our break point.

![Shiny all the things - writing testable code](/images/blog/shiny-all-the-things-writing-testable-code/02-image.gif)

### How you can get started with Shiny

First and foremost I would encourage you to look at the sample app that is part of the [Shiny repo](https://github.com/shinyorg/shiny) (currently in the dev branch for v2). As you'll probably notice the sample leverages the power of building a loosely coupled app by additionally working with Prism and ReactiveUI/Rx principles. This shows how easy it is to build apps that combine the power of each of these libraries and frameworks to more quickly develop incredibly powerful apps. You can additionally choose to leverage the [Prism Container Extensions](https://github.com/dansiegel/Prism.Container.Extensions) with Shiny.Prism. For those who want to help make Open Source more sustainable you might also consider becoming a [GitHub Sponsor](https://github.com/sponsors/dansiegel) and leverage the incredible power of the Prism Magician via the Sponsor Connect package feed and additionally gain various code generators and Roslyn Analyzers to help you keep from making common mistakes while writing less code (since I do it for you). 

-   Check out the [Shiny repo](https://github.com/shinyorg/shiny)
-   [Become a GitHub Sponsor](https://github.com/sponsors/dansiegel)
-   [Inquire](https://avantipoint.com/?utm_source=dansiegel.net&utm_medium=shiny-all-the-things-writing-testable-code) about Enterprise support for your Prism apps
