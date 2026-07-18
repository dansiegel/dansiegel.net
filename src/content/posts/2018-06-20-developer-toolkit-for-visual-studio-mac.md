---
title: "Developer Toolkit for Visual Studio Mac"
description: "Several years ago when I was still just a web developer wanting to break into mobile development, I asked myself how does anybody do this? You have to learn Java..."
publishedAt: "2018-06-20T23:22:00.000Z"
updatedAt: "2018-07-02T15:58:12.000Z"
categories: ["Prism","Xamarin"]
tags: ["Xamarin Forms","Prism","templates","AppCenter","VSTS","DevOps","MobileToolkit"]
legacyUrl: "/post/2018/06/20/developer-toolkit-for-visual-studio-mac"
draft: false
---
Several years ago when I was still just a web developer wanting to break into mobile development, I asked myself how does anybody do this? You have to learn Java for Android, Objective-C or Swift for iOS.... of course then I learned about Xamarin. Without a doubt Xamarin makes the tedious tasks of mobile app development far easier by centralizing your code in one common language, and even further with Xamarin Forms by abstracting the UI into reusable code. That doesn't mean that creating a new app is by any means easy. In fact setting up a new app can take a lot of time.

Nearly a year and a half ago I introduced the Prism QuickStart Templates which were the first .NET Standard templates using the new project format available for Xamarin apps. The project took on a life of it's own and was loved by many even despite it's limited availability in the CLI. As I set out to bring the templates into Visual Studio for Mac, it again took on a life of its own. A number of developers and MVP's were gracious enough to give me their feedback on things they would like to see, and while it may have delayed my ability to release, what we have today is simply stunning.

### Prism Template Studio and Developer Toolkit

Ok I admit it, it's a mouthful, and if you have a better name feel free to tweet it to [@DanJSiegel](https://twitter.com/DanJSiegel). Why the mouthful, because it is absolutely jammed pack with so many tools, so many helpers, and so many templates, that every time I explain it someone asks, "well what about...", and I keep either responding yeah it does that too... or yeah we could add that. It's probably that second one that has admittedly  generated the most delay in getting this out. Whether you use vanilla Xamarin Forms or Prism you'll want to install the Prism Template Studio and Developer Toolkit. 

### Templates

As the name suggests it contains the a Template Pack. This Template Pack isn't quite like anything you've seen before. There are 14 new project templates that ship in this Template Pack, including 7 projects for Unit and UI Testing, 3 more for building Prism Modules, and another 3 for Prism Applications, plus a new basic Xamarin Forms project template.

Each of the templates bring something special for different developers. You can still go with the traditional flat "Official" template, or one includes PropertyChanged.Fody with projects and tests separated into src and tests folders. You can also take advantage of the powerhouse QuickStart Template or the App Center Connected App. Both of these provide the to setup a project in VSTS and automatically configure a Build in App Center.

<iframe src="https://www.youtube.com/embed/An3eiue4KIw" width="560" height="315" frameborder="0" allowfullscreen="allowfullscreen"></iframe>

### Tools

To start there is some integrated tooling for all of your Xamarin projects to enable support for the Mobile.BuildTools, you can connect an existing project to an app in App Center, and even get some quick links to the Prism Docs, GitHub issues, and StackOverflow. Over time you can expect to see additional tooling for App Center, and refinements to do more with VSTS and better expand on your ability to get started with Unit and UI Tests.

Get started today by making sure Visual Studio Mac is up to date, and then simply install the Prism Template Studio and Developer Toolkit from the Extension Manager.
