---
title: "Using \"Unsupported\" DI Containers with Prism"
description: "Developers around the world rely on Prism to build some pretty amazing apps. When I first saw Prism I was amazed at how quickly and easily I could develop an..."
publishedAt: "2018-10-29T01:00:00.000Z"
updatedAt: "2018-10-28T23:35:50.000Z"
categories: ["Prism","Xamarin"]
tags: ["Xamarin Forms","WPF","Prism"]
legacyUrl: "/post/2018/10/29/using-unsupported-di-containers-with-prism"
draft: false
---
Developers around the world rely on Prism to build some pretty amazing apps. When I first saw Prism I was amazed at how quickly and easily I could develop an application with complex needs, but with easy to follow, testable, and maintainable code. As is so often the case, developers tend to have very strong opinions. Which Dependency Injection Container to use is certainly no exception. To some extent developers choices come from what they have experience with.

For a variety of reasons the Prism team cannot support every container that developers may want to use. Prism 7 however made some major changes that make it easier than ever to use a container that isn't officially supported or shipped by the Prism team. Prism imposes very few requirements in order to use a container.

1.  The container must support Transient and Singleton registrations
2.  The container must support registering a specified instance
3.  The container must support keyed registrations / resolving by name
4.  The container must be mutable to support Prism Modularity

In the past when implementing support for your own container, you would still need a fair amount of knowledge of the container, and how Prism is supposed to work. Because of the container abstraction, this requirement has been reduced to only needing to understand the container you want to use.

Amazingly you can introduce support for your container by overriding one additional method from PrismApplicationBase in either Prism.Forms or Prism.WPF, and implementing a single class that handles the mapping between Prism's container abstraction and the container you want to use.

There are some extremely [performant containers](https://github.com/danielpalme/IocPerformance) available such as Grace. As it turns out Grace is a fantastic example as it is virtually on par or slightly more performant than my favorite DryIoc. It's also a mature codebase with releases going back to 2013. It meets all of our "Must Support" items, and it's mutable so it even works with Prism Modularity. Unfortunately for Grace, over it's 5 year history, it has only accumulated around 76,000 downloads. Due to this low user adoption, no matter how performant it may be, it isn't a popular enough container to justify adding to Prism as a supported container.

## Adding a Container Extension

Prism 7's IOC Abstraction simply provides a mapping for the most common Registration and Resolution methods. In the case of the Grace DI Container we simply need to add this single class:

```csharp
public class GraceContainerExtension : IContainerExtension<IInjectionScope>
{
    public GraceContainerExtension()
        : this(new DependencyInjectionContainer())
    {
    }

    public GraceContainerExtension(IInjectionScope injectionScope)
    {
        Instance = injectionScope;
    }

    public IInjectionScope Instance { get; }

    public bool SupportsModules => true;

    public void FinalizeExtension() { }

    public void Register(Type from, Type to) =>
        Instance.Configure(c => c.Export(to).As(from));

    public void Register(Type from, Type to, string name) =>
        Instance.Configure(c => c.Export(to).AsKeyed(from, name));

    public void RegisterInstance(Type type, object instance) =>
        Instance.Configure(c => c.ExportInstance(instance).As(type));

    public void RegisterSingleton(Type from, Type to) =>
        Instance.Configure(c => c.Export(to).As(from).Lifestyle.Singleton());

    public object Resolve(Type type) =>
        Instance.Locate(type);

    public object Resolve(Type type, string name) =>
        Instance.Locate(type, withKey: name);

    public object ResolveViewModelForView(object view, Type viewModelType)
    {
        Page page = null;

        switch(view)
        {
            case Page viewAsPage:
                page = viewAsPage;
                break;
            case BindableObject bindable:
                page = bindable.GetValue(ViewModelLocator.AutowirePartialViewProperty) as Page;
                break;
            default:
                return Instance.Locate(viewModelType);
        }

        var navService = Instance.Locate<INavigationService>(withKey: PrismApplicationBase.NavigationServiceName);
        ((IPageAware)navService).Page = page;
        return Instance.Locate(viewModelType, new[] { navService });
    }
}
```

Once we've added this single class we only need to add to update our App as follows:

```csharp
public partial class App : PrismApplicationBase
{
    protected override IContainerExtension CreateContainerExtension() =>
        new GraceContainerExtension();
}
```

As I mentioned, Prism's IOC abstraction only provides the most common functionality. This means that you could find an advanced scenario where you need direct access to the underlying container. To achieve a more complex registration, you can add an extension method like we provide in the Container specific packages:

```csharp
public static class ContainerExtensions
{
    public static IInjectionScope GetContainer(this IContainerRegistry containerRegistry) =>
        ((IContainerExtension<IInjectionScope>)containerRegistry).Instance;
}
```

You can find a full working [sample app on GitHub](https://github.com/dansiegel/PrismGraceDemo).
