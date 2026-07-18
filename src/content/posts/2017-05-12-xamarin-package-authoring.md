---
title: "Xamarin Package Authoring"
description: "Whether you're just a .NET developer or a Xamarin developer we've all used NuGet. Chances are if you're anything like me, you may have started down the..."
publishedAt: "2017-05-12T05:55:00.000Z"
updatedAt: "2017-05-12T15:56:27.000Z"
categories: ["Xamarin"]
tags: ["NuGet","Mono","Xamarin",".NET","Mac"]
legacyUrl: "/post/2017/05/12/xamarin-package-authoring"
heroImage: "/images/blog/xamarin-package-authoring/01-image.webp"
draft: false
---
Whether you're just a .NET developer or a Xamarin developer we've all used NuGet. Chances are if you're anything like me, you may have started down the development path on some project and developed out some really awesome tools to help you. Then maybe you were in a fancy design meeting. Maybe you were busy thinking how Rome didn't become a great Empire by having meetings... 

![Rome didn't have meetings](/images/blog/xamarin-package-authoring/01-image.webp)

Perhaps you're more like me and you were either at Starbucks or on your way to Starbucks, and a great idea struck. Then you realized that all of the functionality you need you just implemented on this other project. Obviously the answer is to decouple the code you wrote from your last project and put it into it's own project. The problem you ran into though is that you develop on a Mac and NuGet is for PC right?

Now I could go into authoring packages with the new `csproj` format using `dotnet pack`. But truthfully that is a topic all by itself. It's actually something that many developers may not realize you can do. I mean if you go to NuGet.org all you can find is the download for the Windows exe. What people may not realize though is that it's much easier to start authoring packages using the Xamarin toolset than you may realize.

When you installed Xamarin Studio or the newly released Visual Studio for Mac along with the IDE and tooling for Android & iOS development, you actually got Mono. Now if you go to Google and search for Mono because you have no clue what I'm talking about, don't worry, we're not talking about the infectious disease. If you go down under WebMD to the Mono Project you'll see what we're talking about. Bundled in Mono is NuGet and even better the executable is already added to your path so once you open the terminal you can just execute NuGet commands. Now there is one caveat, and it is an important one. Mono for some unknown reason refuses to update the bundled version from 2.12 so you're good if you want to query a NuGet feed or pull a package, but that's pretty much it. Fear not though, you just need to run `sudo nuget update -self`, and it will update to the latest version the same as if you ran it on Windows. 

There are of course some gotcha's here:

1.  If you're building platform specific code that includes the full net framework like net45 you're going to have to build the source on Windows. That said if you built it on your PC but maybe had the project in your DropBox then you can pack the Windows built binary on the Mac
2.  Xamarin Studio/Visual Studio for Mac updates. The updates typically include an Update for Mono which will reset your NuGet version back to 2.12 unless they ever decide to update the bundled version so after running updates on the IDE you will need to update NuGet before packing your projects.
