---
title: "A Dot Net Developer on a Mac"
description: "Recently I had a chance to attend a meetup here in San Diego. To be honest, around other developers I sometimes feel like the odd man out. I mean here I am a C#..."
publishedAt: "2017-04-07T12:32:00.000Z"
updatedAt: "2017-05-09T19:48:43.000Z"
categories: [".NET","Xamarin"]
tags: ["Xamarin Forms","C#"]
legacyUrl: "/post/2017/04/07/a-dot-net-developer-on-a-mac"
draft: false
---
Recently I had a chance to attend a meetup here in San Diego. To be honest, around other developers I sometimes feel like the odd man out. I mean here I am a C# Dot Net developer, and I'm showing up to code with a Mac. It really wasn't all that long ago that you might look at a "C# Developer" doing something like that, as if they were on crack. But the times they are changing. In fact, at that meetup the odd man out, was the dev with a Windows Laptop.

  

I often have conflicting feelings about my development. On the one hand, I absolutely LOVE Visual Studio. As far as I'm concerned it hands down beats every other IDE out there. As I mentioned though, when I'm on the go, more often than not I'm working off my Mac. So then how on earth does a Dot Net developer work on a Mac. Well truthfully if it wasn't for all of the hard work coming from Microsoft the past few years I'm not sure it would be anywhere near as pleasant as it is now.

  

I realize that there are still a lot of short comings with NetStandard, for one it is completely useless for Xamarin libraries that contain XAML files. That said the work that has been done around the NetStandard has been instrumental in making Dot Net even a citizen in non-Windows environments. Part of the problem with being a Dot Net developer outside of Windows is that the tooling was heavily integrated with Windows, so it wasn't as easy as install Mono... go...

  

I have been gleefully watching over the past couple of years as all of that has started to change. One of my recurring issues, and frankly one that may have caused me to pull out a lot of hair, was that Microsoft kept increasing the developer experience around PowerShell. Well that's cool, but everyone else in the world is using Bash and PowerShell wasn't available outside of Windows. So to me I kept asking how stupid can you be to increase the dependency on a Windows Environment? Well truth be told they were working on porting [PowerShell](https://github.com/PowerShell/PowerShell) and it is actually available for Mac and Linux now so any PowerShell commands I may have been running in the past on PC, are now available on Mac.

  

But it really doesn't end with PowerShell. For the past year I have been somewhat vocal about what they call "Visual Studio for Mac", or as I call it "Xamarin Studio with a Visual Studio logo". This week the team released `Preview 6` for VS for Mac. For the first time Mac users like myself are getting a lot closer to some of the critical pieces that have been missing. Now you may have noticed that until now, I haven't mentioned Visual Studio Code. It's not a bad editor, in fact I use it when writing articles for this blog. It's a great environment as well for quickly working up an AspNetCore website and running it locally. But it's been a little frustrating as a Dot Net developer that there hasn't been any tooling (other than PowerShell) that would allow me to connect to Azure and deploy resources right from the IDE. [Preview 6](https://developer.xamarin.com/releases/vs-mac/preview/vs-mac-preview1/#Changes_in_Preview_6) really changes things though. First it brings tooling directly into the IDE to deploy an AspNetCore application straight to Azure whether to an existing resource or a new resource you want to create. The next piece of critical functionality of course... C# 7. It may have taken a month longer, but it's finally available on Mac, proof they really are using the same Rosyln as Visual Studio???
