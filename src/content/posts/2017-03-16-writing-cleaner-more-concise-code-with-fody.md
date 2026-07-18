---
title: "Writing Cleaner, More Concise Code with Fody"
description: "We've all written code that we looked at and said, \"Wow this sucks\". It's not necessarily that the code itself sucks, but perhaps we just have to make the code..."
publishedAt: "2017-03-16T04:35:00.000Z"
updatedAt: "2017-05-09T19:47:50.000Z"
categories: [".NET"]
tags: ["MVVM","C#","Fody"]
legacyUrl: "/post/2017/03/16/writing-cleaner-more-concise-code-with-fody"
draft: false
---
We've all written code that we looked at and said, "Wow this sucks". It's not necessarily that the code itself sucks, but perhaps we just have to make the code very verbose, and we wish there was some way we could clean it up. Just as an example I'll pick on `INotifyPropertyChanged`. Chances are if you work with an MVVM framework like Prism or MvvmCross, you're pretty used to this. I am a huge fan of simple, elegant, and self documenting code. The problem with `INotifyPropertyChanged`, is that while it's necessary, it also bloats our code, and can quickly make it a little harder to see what our real intent is.

```csharp
// The standard format for a Prism ViewModel
public class MyPageViewModel : BindableBase
{
    private string _email;
    public string Email
    {
        get { return _email; }
        set
        {
            if( SetProperty( ref _email, value ) )
            {
                OnEmailChanged();
            }
        }
    }

    private bool _isValid;
    public bool IsValid
    {
        get { return _isValid; }
        set { SetProperty( ref _isValid, value ); }
    }

    public void OnEmailChanged()
    {
        IsValid = RegEx.IsMatch( Email, AppSettings.EmailRegExPattern );
    }
}
```

Now it's great that so many framework's give us some sort of base class we can inherit from that already implements `INotifyPropertyChanged` so we at least don't have to do that, but let's be honest our real intent is more like:

```csharp
// First possible refactoring
public class MyPageViewModel
{
    public string Email { get; set; }

    public bool IsValid { get; set; }

    public void OnEmailChanged()
    {
        IsValid = RegEx.IsMatch( Email, AppSettings.EmailRegExPattern );
    }
}
```

Or even simpler like:

```csharp
// Second possible refactoring
public class MyPageViewModel
{
    public string Email { get; set; }

    public bool IsValid
    {
        get { return RegEx.IsMatch( Email, AppSettings.EmailRegExPattern ); }
    }
}
```

The question you may have, is how can you get your code simplified like the last two examples? This is where it's important to take a moment, and look at one of those things, that most of us developers do not like to think about. Let's be honest, it's something that to most of us, is easier to consider "Magic". Often we just think about the code we write, and then it ends up a compiled library or executable. The thing is, there is all sorts of stuff we can do during compilation to manipulate our code. [Fody](https://github.com/Fody/Fody) offers some excellent tooling to do exactly this, and with their [PropertyChanged library](https://github.com/Fody/PropertyChanged) you can easily add `INotifyPropertyChanged`.

  

After installing the library, your ViewModel simply needs to add a single attribute and `INotifyPropertyChanged` will be 'Weaved' in.

```csharp
[InjectPropertyChanged]
public class MyPageViewModel
{
    // ViewModel implementation
}
```

Given the above examples of what we might like to do, the generated class would look like the following:

```csharp
// First refactoring generated output
public class MyPageViewModel : INotifyPropertyChanged
{
    string email;
    public string Email
    {
        get { return email; }
        set
        {
            if( email != value )
            {
                email = value;
                OnEmailChanged();
                OnPropertyChanged( "Email" );
            }
        }
    }

    bool isValid;
    public bool IsValid
    {
        get { return isValid; }
        set
        {
            if( isValid != value )
            {
                isValue = value;
                OnPropertyChanged( "IsValid" );
            }
        }
    }

    public virtual void OnEmailChanged()
    {
        IsValid = RegEx.IsMatch( Email, AppSettings.EmailRegExPattern );
    }

    public event PropertyChangedEventHandler PropertyChanged;

    public virtual void OnPropertyChanged(string propertyName)
    {
        var propertyChanged = PropertyChanged;
        if (propertyChanged != null)
        {
            propertyChanged(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}
```

Or the second preferred example:

```csharp
// Second refactoring generated output
public class MyPageViewModel : INotifyPropertyChanged
{
    string email;
    public string Email
    {
        get { return email; }
        set
        {
            if( email != value )
            {
                email = value;
                OnPropertyChanged( "Email" );
                OnPropertyChanged( "IsValid" );
            }
        }
    }

    public bool IsValid
    {
        get { return RegEx.IsMatch( Email, AppSettings.EmailRegExPattern ); }
    }

    public event PropertyChangedEventHandler PropertyChanged;

    public virtual void OnPropertyChanged(string propertyName)
    {
        var propertyChanged = PropertyChanged;
        if (propertyChanged != null)
        {
            propertyChanged(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}
```

You may notice a couple of key differences here, and they will have an impact on our application. The differences can be extremely subtle. In the first example we execute an action when our `Email` property is updated. In the second we have no action executed but we call `OnPropertyChanged` for the `IsValid` property anytime the `Email` property is updated. What does all of this mean?

  

I fully admit I really like the syntax of the second refactoring, it is far more elegant. That said, there is a particular problem that we would face using this syntax. Take the email `john.doe@gmail.com`, and say that the Email field is bound to an Entry field. When the user types 'j' `OnPropertyChanged` is called for the `Email` property and `IsValid` property. The user types 'o', again `OnPropertyChanged` is called for both properties. This would continue for every single character meaning that the UI would have to respond to the event for both bindings.

  

Now say that you use the first implementation where you call the action `OnEmailChanged` when the `Email` property is changed, and this then executes `IsValid = RegEx.IsMatch( Email, AppSettings.EmailRegExPattern )`. What we are really doing is checking to see if anything has really changed. Again saying that the user types 'j', the action attempts to set a value of 'false' for `IsValid`. Since the property already was false, `OnPropertyChanged` is never called and the UI never has to respond to it. In fact the user would have to have entered `john.doe@gmail.co` before we would see `OnPropertyChanged` being executed for the `IsValid` property. Another way of putting it that we would have been telling the UI to do something 17 times, taking up CPU time that was never needed. Then we would notify the UI again when the user typed the final character.

  

By using a helper like Fody, we can instead write clean concise code, following the best coding practice that fits our exact situation.
