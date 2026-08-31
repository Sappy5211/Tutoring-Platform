[Skip to main content](https://help.remnote.com/en/articles/9124137-the-fsrs-spaced-repetition-algorithm#main-content)

# The FSRS Spaced Repetition Algorithm

FSRS is a newer, more complex scheduling algorithm that can improve your study efficiency significantly.

Written by Soren Bjornstad
Updated over a week ago

Table of contents

[Enabling FSRS](https://help.remnote.com/en/articles/9124137-the-fsrs-spaced-repetition-algorithm#h_7fe8d996f9)[Optimizing FSRS parameters](https://help.remnote.com/en/articles/9124137-the-fsrs-spaced-repetition-algorithm#h_50b4332a48)[Learning and relearning steps](https://help.remnote.com/en/articles/9124137-the-fsrs-spaced-repetition-algorithm#h_f81f3e13c1)[The parameters](https://help.remnote.com/en/articles/9124137-the-fsrs-spaced-repetition-algorithm#h_1d91049e52)[How does FSRS work?](https://help.remnote.com/en/articles/9124137-the-fsrs-spaced-repetition-algorithm#h_d5a6dde92a)

In addition to the default [Anki SM-2](https://help.remnote.com/en/articles/6026144-the-anki-sm-2-spaced-repetition-algorithm) scheduling algorithm, RemNote supports the new [FSRS](https://github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm) (Free Spaced Repetition Scheduler) algorithm. FSRS was developed by Jarrett Ye, made available for some time as a plugin in RemNote, and has now been incorporated directly into RemNote.

![The Global Default Scheduler setting with FSRS v6 selected, above a schedule preview showing how sample answer sequences map to growing intervals.](https://downloads.intercomcdn.com/i/o/akxf7g7x/2565161159/ac21ca6a2589ba0faf3b07c6c29a/CleanShot+2026-07-25+at+13_22_11%402x.png?expires=1788118200&signature=fa030686f9c39dc41f18c045027482eaf0ab41b1b3d8324b2e5a942ee1cf0890&req=diUhE8h4nIBaUPMW1HO4zafr4U4iXo7XNSeC5JXySH%2FP1R4vomueFwAaiWYc%0AxEJpP5zpxJIGkYPKC4E%3D%0A)

FSRS is somewhat more difficult to understand than Anki SM-2, and is not as customizable, but in return it schedules cards substantially more accurately. In general, you can expect to do **20–30% fewer reviews** to achieve the same level of knowledge retention when using FSRS.

**FSRS is a beta feature.** It may become the default scheduler in the future, but for now you need to manually enable it, and there may be some bugs left, so we'd recommend not using it on critical cards until we've had more time to verify that it works well.

We're currently using **FSRS version 6**.

# Enabling FSRS

You can switch to scheduling with FSRS for all of your flashcards or for only some of them. Start by going to _Settings > Schedulers_, then:

- To enable FSRS for **all cards**, click the pencil icon next to the _Global Scheduler_.

- To enable FSRS for **only some cards**, click _Create Scheduler_, then edit that scheduler. After configuring the new scheduler, you'll select the scheduler in certain documents or folders; see [Custom Schedulers](https://help.remnote.com/en/articles/6958056-custom-schedulers) for details.


Inside the scheduler settings, select a _Scheduler Type_ of _FSRS v6_:

![The Scheduler Type options in the scheduler settings, with FSRS v6 selected below Exponential (legacy) and Anki SM-2.](https://downloads.intercomcdn.com/i/o/akxf7g7x/2472656394/8db4f42f76b31c4cfdadf73c8428/CleanShot+2026-06-12+at+16_18_22%402x.png?expires=1788118200&signature=2c95d77172f71a6886f9971f27800330f8164c5a168fdafd2a3d35b753edf785&req=diQgFM97m4JWXfMW1HO4zamW2OlJal5gVBb42sTfXuEmCn7SSv0yIuHkZaQc%0AkTTZtvkHCSrwX88WYwo%3D%0A)

You can customize the parameters lower down if you wish. You can customize the parameters lower down if you wish. FSRS has fewer user-customizable parameters than SM-2, because in SM-2 you have to work out the ideal values yourself to get optimal retention, whereas FSRS can determine most of them from your past study history (see the following section).

# Optimizing FSRS parameters

**Note**:Don't fret about using optimization exactly right – it has only a small impact on your study efficiency, and never optimizing at all and just sticking with the default weights would be a perfectly reasonable choice.

The **weights** parameter shown in the scheduler settings is actually 17 different parameters combined into one, which collectively control the rate at which intervals and difficulties change as you review. They're combined because they are difficult to interpret and should normally not be changed by humans. Instead, you can either use the default parameters (which are trained on a dataset including millions of reviews and should be excellent already right out of the box) or run the _optimizer_ to calculate new weights based on your past reviews.

What does the optimizer do? The details are complex and quite technical, but in a nutshell, FSRS will work through your study history on every card and calculate what values of the parameters would have, collectively, yielded the most efficient results had they been used from the start. Then it will change the weights to actually use these values for future reviews, assuming that the way your memory will behave on those future reviews will be similar to past ones.

To use the optimizer, click the _Auto train weights on your knowledge base_ button in the scheduler settings (see the [Enabling FSRS](https://help.remnote.com/en/articles/9124137-the-fsrs-spaced-repetition-algorithm#h_7fe8d996f9) section above for where to find these). RemNote will run the optimizer on your review history and replace the values in the Weights textbox accordingly.

Before optimizing, you should do **at least 1,000 reviews** with the default weights – until you have plenty of data for the optimizer to work with, the default weights will be more effective than ones based on your study history. RemNote will warn you if you try to train with fewer reviews.

# Learning and relearning steps

When you see a card for the first time, or when you forget one you thought you knew, a single review usually isn't enough to make it stick. FSRS handles this with **learning steps** for new cards and **relearning steps** for cards you've forgotten: short, fixed intervals that repeat the card within your current session before it graduates to a normally scheduled interval.

Say you meet a new card and press _Forgot_. Rather than waiting until tomorrow to try again, RemNote will show it to you again a few minutes later in the same session, and keep doing so until you can answer it, at which point FSRS takes over and schedules it properly. Cards you forget after having learned them go through the same process, which gives you a chance to rebuild the memory before the algorithm has to guess at how long you'll hold on to it.

The steps are written as a list of durations, so a value like `1m,10m` means the card is shown again after one minute, then after ten, before graduating. Longer or more numerous steps mean more repetition up front and less risk of forgetting, at the cost of a longer session. If you're coming from Anki SM-2, this will feel familiar: it works much like the [Learning and Relearning Phases](https://help.remnote.com/en/articles/6026144-the-anki-sm-2-spaced-repetition-algorithm) there.

## The parameters

Three fields in the scheduler settings control this behavior:

- **Learning Phase Steps**: the short intervals a new card passes through before FSRS takes over and begins scheduling longer reviews. Leave this blank to allow FSRS to choose the intervals starting immediately (usually starting with an interval of several days).

- **Relearning Phase Steps**: how quickly a card you have forgotten repeats before it returns to its normal FSRS schedule.

- **New Card Forgot Interval**: when you forget a card you have never seen before, RemNote will wait this many minutes to show it to you again. (If you set Learning Phase Steps above, the card simply returns to the first step instead.) Forgetting a card at any later stage in the process instead uses the Relearning Phase Steps.


# How does FSRS work?

At its heart, FSRS is actually quite similar to SM-2: it uses simple arithmetic to calculate next intervals and difficulties for each card. As such, if you have no background in spaced repetition algorithms, you can get a good idea of the general process involved by [reading about how SM-2 works](https://help.remnote.com/en/articles/6026144-the-anki-sm-2-spaced-repetition-algorithm).

However, in FSRS, both the formulas involved and the process used to arrive at the ”magic numbers” and parameters are more complex. Together, they require some mathematical background and some concentrated effort to fully understand. If you're interested in diving into the details, we recommend checking out the following guides:

- [Spaced Repetition Algorithm: A Three-Day Journal from Novice to Expert](https://github.com/open-spaced-repetition/awesome-fsrs/wiki/Spaced-Repetition-Algorithm%3A-A-Three%E2%80%90Day-Journey-from-Novice-to-Expert) (detailed primer)

- [FSRS: The Algorithm](https://github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm) (quick reference)


* * *

Related Articles

- [The Anki SM-2 Spaced Repetition Algorithm](https://help.remnote.com/en/articles/6026144-the-anki-sm-2-spaced-repetition-algorithm)
- [Custom Schedulers](https://help.remnote.com/en/articles/6958056-custom-schedulers)
- [Flashcard Statistics](https://help.remnote.com/en/articles/7970392-flashcard-statistics)
- [Understanding the Exam Scheduler](https://help.remnote.com/en/articles/9102040-understanding-the-exam-scheduler)
- [Understanding Spaced Repetition](https://help.remnote.com/en/articles/9337171-understanding-spaced-repetition)

Did this answer your question?

😞😐😃

Table of contents

[Enabling FSRS](https://help.remnote.com/en/articles/9124137-the-fsrs-spaced-repetition-algorithm#h_7fe8d996f9)[Optimizing FSRS parameters](https://help.remnote.com/en/articles/9124137-the-fsrs-spaced-repetition-algorithm#h_50b4332a48)[Learning and relearning steps](https://help.remnote.com/en/articles/9124137-the-fsrs-spaced-repetition-algorithm#h_f81f3e13c1)[The parameters](https://help.remnote.com/en/articles/9124137-the-fsrs-spaced-repetition-algorithm#h_1d91049e52)[How does FSRS work?](https://help.remnote.com/en/articles/9124137-the-fsrs-spaced-repetition-algorithm#h_d5a6dde92a)