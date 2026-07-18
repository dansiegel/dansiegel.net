---
title: "Poor Man's Design Strategy for Dynamic Code in PHP"
description: "Perhaps this has happened to you. You're working on a code base and as you scroll through the code you see something like: I fully admit it drives me absolutely..."
publishedAt: "2015-09-01T10:58:00.000Z"
updatedAt: "2017-05-09T19:45:25.000Z"
categories: []
tags: ["PHP"]
legacyUrl: "/post/2015/09/01/poor-man-s-design-strategy-for-dynamic-code-in-php"
draft: false
---
Perhaps this has happened to you. You're working on a code base and as you scroll through the code you see something like:

```php
if( $foo == "bar" )
{
    $name = $foo;
    # Execute some code
}
else if( $foo == "fu" )
{
    $name = $foo;
    # Execute the same code we just did....
}
else if( $foo == "fubar" )
{
    $name = $foo;
    # Execute the same code we did the last two times...
}
// and so on....
```

I fully admit it drives me absolutely crazy when I see code that is complete reusable and someone decided to type it out two, three, four, or WTF were you thinking times... It's usually about the time where I am grateful I live in San Diego where we have so many great micro-breweries.

  

A couple of years ago I was working on a code base that had this type of just generally bad code all over the place. On top of this though was the fact that every time a new report page had to be written the Report List Page had to be updated with code like you see above. To make matters worse every time a new report category like "Admin Reports" or "Client Reports" or "Billing Reports" was added an entirely new 'else if' had to be added. The biggest problem was that the code wasn't quite like above it was more like:

```php
# Admin Reports
$admin_rows = array( $stuff );

# Client
$client_rows = array( $stuff );

# Billing
$billing_rows = array( $stuff );

$table = array(
    array(
        $client_rows,
        $admin_rows
    ),
    array(
        $billing_rows
    )
);
```

That may not seem so bad, but this ended up in a bloated file that was in excess of 1000 lines of code.

  

There are always those days for a developer where you can say "and finally the day came...", and it did. Finally I had to add a new report and I refused to add to the mess. As is my style, I looked for a solution that had a certain elegance to it, something that could dynamically provide what I needed at runtime. My ultimate goal was to stop having to update the Report List page every time we added a new report.

  

Now to be fair here I did know a few constraints.

-   I knew the possible Report Categories that would exist
-   I knew that all of the Reports would start with the word 'Reports'
-   I knew that some reports were used more than once as a different report by passing in different parameters.

  

As you are probably all too familiar, if you give a thousand programmers a problem you'll get a thousand solutions. What I opted for is what I lovingly refer to as the "Poor man's Reflection Design Pattern in PHP". It's of course not quite true reflection but a design pattern that allows us to look at our project's classes for a known attribute to assist us.

### Step 1:

  

The first thing that I needed was some way of identifying what a particular report was. For this I opted to create an array of hash-tables (aka associative arrays). This allowed me to identify information about each report dynamically and use that to decide how it needed to be constructed.

```php
class ReportsFooBar
{
    public $report_info = array(
        array(
            'category' => 'FooBar',
            'active' => 1,
            'order' => 3,
            'title' => 'Foo...',
            'description' => 'When things are foo bar',
            'request' => '?bar=true'
        )
    );

    # some more code...
}
```

### Step 2:

  

Implement the "Poor man's reflection design pattern". This looks at the php classes in a defined space. To save a few processing cycles we discard any classes which did not meet our requirement for starting with Reports. Then we load this into a hash table that will let us get the information we collected to build out our view.

```php
# Load the local php files with a name containing 'Report'
# Setup an empty array of reports we will need to build our view for our reports
$reports = array();
foreach( $file_array as $key => $filename )
{
    # Do some cleanup to get the filename as a class name
    $report = new $filename();
    $report_info = $report->{'report_info'};

    # $report_info was not declared in our report class
    if( !$report_info ) continue;

    # Add report to the report hash
    for( $i = 0; $i < count( $report_info ); $i++ )
    {
        # Set report at $reports[category][order]
        $reports[strtoupper[$report_info[$i]['category']]][(int)$report_info[$i]['order']] = array(
            'title' => $report_info['title'],
            'description' => $report_info['description'],
            'request' => $report_info['request']
        );
    }
}
```

### Bonus Step:

The end result ultimately needed on additional step as you saw above we were doing the same thing over and over. Ultimately for as clever as my solution was to discover reports, it still wasn't good enough. To finish I had to literally make my variable name a variable itself. While I cannot get into the full implementation here, it looked something like:

```php
foreach( $reports as $category => $report_info )
{
    ${"{$category}_row"} = array();
    ${"{$category}_cell"} = array();
    # do foo...
}
```
