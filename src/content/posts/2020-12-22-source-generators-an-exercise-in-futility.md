---
title: "Source Generators an Exercise in futility"
description: "Some time ago I did a live stream with Jérôme Laban from the Uno Platform team on Source Generators. This actually predated a lot of the more recent excitement..."
publishedAt: "2020-12-22T12:26:00.000Z"
updatedAt: "2020-12-13T21:26:04.000Z"
categories: [".NET","Prism","Xamarin"]
tags: ["source generators","Prism",".NET","Roslyn","Uno Platform"]
legacyUrl: "/post/2020/12/22/source-generators-an-exercise-in-futility"
heroImage: "/images/blog/source-generators-an-exercise-in-futility/01-Picture1.webp"
draft: false
---
Some time ago I did a live stream with Jérôme Laban from the Uno Platform team on Source Generators. This actually predated a lot of the more recent excitement with the Roslyn based Source Generators that are now generally available as part of Visual Studio 16.8. As I got to learn more about Source Generators I quickly learned just how powerful they are.. because I'm lazy and dislike manually doing more than I have to (most developers I know are the same way).

<iframe src="https://www.youtube.com/embed/ju8aUa-clHs" width="560" height="315" frameborder="0" allowfullscreen="allowfullscreen"></iframe>

Amusingly out of our sheer laziness, we often have defaulted to falling back to runtime reflection. Of course there is a performance cost, that we generally like to dismiss because we can't build much more dynamic applications. To be fair this tradeoff also comes with some benefits for maintainability. With Source Generation though we can shift this reflective cost from the runtime to the build time. This means if we're going to pay a 1-2 second cost, let the developer or CI build take the hit instead of the app user every time they use our app. 

As you may have noticed some of the runtime reflection that we added to Prism 7, rather suddenly was stripped out by Brian in Prism 8 after he learned about my side project the [Prism Magician](https://prismmagician.com/). The Magician was built using the techniques that I learned from Jérôme, along with a few other tricks I had up my sleeve. But hey the Roslyn team finally brought us Source Generation out of the box, so if we can get rid of a dependency why wouldn't we want to do that? Well get ready for the good the bad and the utterly WTF moments that come with that...

## The Good!

Naturally being something that is out of the box that just works is always a great thing. It's also fantastic that this builds on what we've already been doing, as we can now ship Source Generators as part of the same Roslyn Analyzers package that we may already be shipping, and at the very least we have a technique for packing these or including them in our project that is already being widely used. So far so good, no complaints right....

![Source Generators](/images/blog/source-generators-an-exercise-in-futility/01-Picture1.webp)

## The Bad...

Actually much to the Uno Platform team's credit with their Source Generation package, there is a recognition that there are a lot of common extensions you'll want/need when writing Source Generators. These come standard as part of the Uno.SourceGeneration package and are obviously not present when working directly with the Source Generators from the .NET team.

Next up is actually just one of the general issues with Source Generation, which is that you're ultimately just using a string builder. While the Uno Platform team does give you an IndentedStringBuilder that you can use to more easily manage code indentation and blocks such as for namespaces, classes, methods, etc... again this is totally missing from the .NET team so you get an out of the box string builder. The good news on this front is that I do have a [CodeGenHelpers library](https://github.com/dansiegel/CodeGenHelpers) that you can include that really helps to more dynamically build your source code and generate clean output with a fluent builder approach.

## WTF!!!!

As is often the case, docs and the actual API's are a bit out of sync to a point where the documentation literally says that you should expect behavior that was specifically dropped during the previews. Have fun with that one... So what is the behavior anyway? Well the behavior is that by default the Generators will not actually output the generated source to the disk. While the theory is that you can always navigate to reference, not all references will be in your code, and it can actually often be far more difficult than it should be to see what was generated, even where there are errors Visual Studio will generally not navigate to the Generated code. You can of course fix it if you know to add the following undocumented property to your project (the one consuming the generator). Note that adding this will add a generated folder in the temporary output (obj\\{targetframework}).

```xml
<PropertyGroup>
  <EmitCompilerGeneratedFiles>true</EmitCompilerGeneratedFiles>
</PropertyGroup>
```

Ok that's it, right??? Nope, not by a long shot... I did say earlier who wouldn't want to use the approach from the .NET team right... and after all as much as I love the work from the Uno Platform team, it's always nice to get rid of a dependency when you can (and when it makes some sense)... So I've spent the last few weeks working on a fairly significant rewrite of the Prism Magician so that it would do all of the Source Generation using the new Roslyn approach. It works marvelously on .NET Standard, and for both Xamarin.iOS and MonoAndroid targets.

It might seem like I've skipped a few targets. If you've been following me for a while you know I'm a maintainer for the Prism Library, and we love WPF and Uno Platform projects, and not just Xamarin.Forms. The Prism Magician is a fairly beefy solution, not so much because there are a ton of projects that need to get packed, but because there are about 16 test projects that test the Magician for Prism.Forms, Prism.Wpf, & Prism.Uno. So what happened?

After finally completing the migration and getting all of the Prism.Forms projects stable, I was immediately blocked. While the generators did run for netstandard2.0 and Xamarin.iOS and MonoAndroid targets, no source was added for the UWP target in the Uno Platform test projects (although a generated folder was created). What's worse though is that the generators fail to run completely for WPF (you can track the issue [here](https://github.com/dotnet/wpf/issues/3404#issuecomment-682609361)). The issue has actually been know about since August but, hasn't exactly been discussed openly as a known short coming.

## Final Thoughts

Source Generators are amazing. For those of you building apps with Prism and who are able to target Prism 8, you should absolutely consider using the Prism Magician it will solve a ton of issues for you, and gives you a lot more than Source Generators. For everyone else look at areas that you currently fall back on runtime reflection and consider replacing it with a Source Generator. 

For now though, it appears that the next release of the Prism Magician will have to include some shims to take the reworked generators and make them work with the Uno Source Generators.
