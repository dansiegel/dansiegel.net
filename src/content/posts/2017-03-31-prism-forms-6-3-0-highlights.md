---
title: "Prism Forms 6.3.0 Highlights"
description: "For those following Prism 6.3, it's been a while coming, but there is a lot there. Here are a few helpful things to get you going. Behaviors One of my favorite..."
publishedAt: "2017-03-31T01:47:00.000Z"
updatedAt: "2017-05-09T19:48:08.000Z"
categories: [".NET","Prism","Xamarin"]
tags: ["Prism","Xamarin Forms","C#"]
legacyUrl: "/post/2017/03/31/prism-forms-6-3-0-highlights"
draft: false
---
For those following Prism 6.3, it's been a while coming, but there is a lot there. Here are a few helpful things to get you going.

## Behaviors

One of my favorite additions to Prism Forms 6.3.0 is the addition of Behaviors. First of all Prism gives you a great `BehaviorBase<T>` class you can use for all of your custom behaviors. But we finally have an `EventToCommandBehavior` that allows us to execute our ViewModel Commands when an event is triggered, and the control doesn't directly support Commands for that event. This is great for things like attaching to something like a `ListView` where we might want to work with the `ItemTapped` or `ItemSelected` events. You have a wide degree of flexibility here where you can choose to directly accept the EventArgs in your command or you can use a custom converter to grab the item from the EventArgs.

## NavigationParameters

One of the breaking API changes you may notice is with the NavigationParameters. In the past, the NavigationParameters was based on a Dictionary which gave us the limitation that a key could only be used once in the querystring. While most of the time this was fine, there are so many cases where you just need to pass a list of something. Along with the new implementation are some great helpers including both a `GetValue<T>` and `GetValues<T>`. These are also safe to use if the key didn't actually exist so there's no more need for `if( parameters.ContainsKey("foobar")) FooBar = (Foo)parameters["foobar"]`. Naturally you will get a default value, so do check for \`null\`.

## INavigationAware

Probably one of the most used interfaces in my Prism Forms apps, is INavigationAware. This is a major breaking change. That said, it's worth the frustration of the breaking change here. First of all `INavigationAware` is no longer a standalone interface. It is now actually the combination of two concepts `INavigatingAware` and `INavigatedAware`. As the verbs imply, one is based on Navigation that is about to occur, while the other is about Navigation that has occurred. One of the complaints I often heard, and frankly had myself was that with `OnNavigatedTo`, there was a visible UI update as my ViewModel was updating the Values that were bound on the UI. `INavigatingAware` with it's singular `OnNavigatingTo` really helps to address this problem.

The reason why we were seeing the UI changes was that the ViewModel never had a chance to load before we pushed the page onto the Navigation Stack. `OnNavigatingTo` is only called once, and only before we actually push the page to the stack. Like the sample below shows, we may have some default value that is really only there to alert the developer of a problem or is there for the design time. With the `OnNavigatingTo`, this value will no longer appear when the the page is actually pushed as the value of `Message` will update to whatever was in the NavigationParameters.

```csharp
public class FooBarViewModel : BindableBase, INavigatingAware
{
	private INavigationService _navigationService { get; }

	public FooBarViewModel( INavigationService navigationService )
	{
		_navigationService = navigationService;
	}

	private string _message = "some default value"
	public string Message
	{
		get { return _message; }
		set { SetProperty( ref _message, value ); }
	}

	public void OnNavigatingTo( NavigationParameters parameters )
	{
		Message = parameters.GetValue<string>( "message" );
	}
}
```

## BindableBase Update

So this one got snuck in last minute. `BindableBase` now allows you to specify an action when the value is changed. Also changed was the change up to call `RaisePropertyChanged` when a property has been changed. This becomes highly useful in a variety of situations like the with the following:

```csharp
public class Person : BindableBase
{
    private string _firstName;
    public string FirstName
    {
        get { return _firstName; }
        set { SetProperty( ref _firstName, value, () => RaisePropertyChanged( nameof( Name ) ) ); }
    }

    private string _lastName;
    public string LastName
    {
        get { return _lastName; }
        set { SetProperty( ref _lastName, value, () => RaisePropertyChanged( nameof( Name ) ) ); }
    }

    public string Name => $"{FirstName} {LastName}";
}
```

## IActiveAware

For long time Prism users, `IActiveAware` is nothing new. In fact it's been there the whole time. But for Prism Forms, it's really been useless until 6.3.0. With the addition of behaviors, 6.3.0 adds a new behavior to help with one of the major problems that we have when using any MultiPage such as a TabbedPage or CarouselPage in our application. That problem of course, how on earth do you figure out when the user is actually on your page. How to handle the Children of a MultiPage is something that we will be seeing some additional work on before the next release. But in the mean time the `IActiveAware` behavior really gives us a great tool. Going forward with 6.3.0, I expect we will see a lot of developers adopting a pattern of making ViewModels for children of TabbedPages like the following:

```csharp
public class TabbedChildPageAViewModel : BindableBase, INavigationAware, IActiveAware
{
	private bool isInitialized = false;

	public event EventHandler IsActiveChanged;

    private bool _isActive;
	public bool IsActive
    {
        get { return _isActive; }
        set { SetProperty( ref _isActive, value, OnIsActiveChanged ); }
    }

	public void OnNavigatingTo( NavigationParameters parameters )
	{
		if( isInitialized ) return;
		isInitialized = true;

		// Implement loading logic here
	}

    private void OnIsActiveChanged()
    {
        // Do Foo
    }
}
```

with a TabbedPage like the following:

```csharp
public partial class MyTabbedPage : TabbedPage, INavigatingAware
{
	public MyTabbedPage()
    {
        InitializeComponent();
    }

    public void OnNavigatingTo( NavigationParameters parameters )
    {
        foreach( var child in Children )
        {
            // You only need to do this on the child if any of your child pages actually implement this.
            ( child as INavigatingAware )?.OnNavigatingTo( parameters );
            ( child?.BindingContext as INavigatingAware )?.OnNavigatingTo( parameters );
        }
    }
}
```

With this strategy you can now both initialize your Tabbed Page Children, and handle the Activation/Deactivation events that occur when the user changes the tab. You can check out a complete example of this in the [Prism Samples](https://github.com/PrismLibrary/Prism-Samples-Forms).
