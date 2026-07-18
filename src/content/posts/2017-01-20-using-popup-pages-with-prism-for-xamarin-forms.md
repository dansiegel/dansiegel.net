---
title: "Using Popup Pages with Prism for Xamarin Forms"
description: "So often as mobile developers we use some sort of Popup view. Really the reasons why we want to do this simple task are pretty endless. For too long it's been..."
publishedAt: "2017-01-20T00:29:00.000Z"
updatedAt: "2017-05-09T19:47:22.000Z"
categories: [".NET","Prism","Xamarin"]
tags: ["Popups","Prism","Xamarin Forms"]
legacyUrl: "/post/2017/01/20/using-popup-pages-with-prism-for-xamarin-forms"
draft: false
---
So often as mobile developers we use some sort of Popup view. Really the reasons why we want to do this simple task are pretty endless. For too long it's been something that wasn't an option for Xamarin Forms. Then came one of my favorite new packages [Rg.Plugins.Popup](https://github.com/rotorgames/Rg.Plugins.Popup). The only problem is that the library requires navigation through their Popup Navigation Service instead of being integrated in with the Xamarin Forms.

  
This creates an issue for Prism Applications. How do you navigate to Popup Pages while maintaining a proper MVVM pattern? The solution, [Prism.Plugin.Popups](https://github.com/dansiegel/Prism.Plugin.Popups). With Prism.Plugin.Popups, Prism based apps can now navigate to Popup Pages using the Prism INavigationService that you're already using. Best of all, there is no configuration required. The plugin adds several new extensions in the Prism.Navigation namespace, so simply adding the INavigationService to your ViewModel and using the Prism.Navigation namespace is all you need to do.

```csharp
using Prism.Navigation;
using Prism.Commands;
using Prism.Mvvm;

namespace MyApp.ViewModels
{
	public class MainPage : BindableBase
	{
		public MainPage( INavigationService navigationService )
		{
			_navigationService = navigationService;

			NavigateCommand = new DelegateCommand( OnNavigateCommandExecuted );
		}

		INavigationService _navigationService { get; }

		DelegateCommand NavigateCommand { get; }

		private async void OnNavigateCommandExecuted() =>
			_navigationService.PushPopupPageAsync( "MyPopupPage" );
	}
}
```

As mentioned before we're using the INavigationService, and just like the INavigationService you'll need to register your View and/or ViewModel the same as if you're registering any other pages for your application. One caveat to this, in order to function as an extension of the INavigationService it requires specific knowledge of the Container you're using as we have to use your container to resolve the View. As a result there is a container specific implementation for each of the public containers for Prism for Xamarin Forms.
