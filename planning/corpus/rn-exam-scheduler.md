[Skip to main content](https://help.remnote.com/en/articles/9102040-understanding-the-exam-scheduler#main-content)

# Understanding the Exam Scheduler

What's different about studying for an exam than studying for the long term, and how does RemNote account for that?

Written by Soren Bjornstad
Updated over 3 weeks ago

Table of contents

[The problem](https://help.remnote.com/en/articles/9102040-understanding-the-exam-scheduler#h_ef3c866269)[Background](https://help.remnote.com/en/articles/9102040-understanding-the-exam-scheduler#h_767c240ad0)[Changes made by the exam scheduler](https://help.remnote.com/en/articles/9102040-understanding-the-exam-scheduler#h_cc77fdab7d)

_This article explains the design choices and math behind RemNote's exam scheduler. While you'll get a better experience from the exam scheduler if you fully understand it, if you're looking for practical advice on getting ready for an exam right now and you don't have the time to spend fully understanding it yet, check out [Preparing for an Exam](https://help.remnote.com/en/articles/9101991-preparing-for-an-exam) first_!

# The problem

Traditional [spaced-repetition algorithms](https://help.remnote.com/en/articles/9337171-understanding-spaced-repetition) optimize for remembering the largest possible volume of information as efficiently as possible over an indefinite time period. They do a great job at this! But if you have exams coming up, that’s probably not quite what you want – instead, you want to optimize for remembering some set of material as well as possible at one short moment in time. (Of course, these goals aren’t mutually exclusive – you can keep practicing your material after your exam if you think it’s worth remembering long-term.)

RemNote is the first general-purpose spaced-repetition tool to offer automatic scheduling adjustments for students preparing for exams.

# Background

To understand how RemNote adjusts for exams, we need a quick refresher on how memory works. (For more details, check out [Understanding Spaced Repetition](https://help.remnote.com/en/articles/9337171-understanding-spaced-repetition).) Spaced repetition requires considering at least two facts about your memory of each card which change over time:

- A card’s **retrievability** is the probability you’ll be able to successfully recall the answer within a short amount of time, if the card is presented to you for review. Retrievability decreases steadily over time, then jumps up to near 100% again when you recall the answer.

​

In spaced repetition practice, we aim to always keep the retrievability of our cards higher than some threshold (often called **desired retention** or **forgetting index**), so that we always have a good chance of remembering them when we need them. The amount of practice required increases exponentially as the desired retention approaches 100% – that is, each additional minute we spend practicing boosts our memory less than the minute before did – so most spaced repetition systems aim for a desired retention of 85–90%, which is a good balance between effectiveness and practice time. When a card's estimated retrievability drops below the desired retention threshold, it enters your queue for practice.

​

An important but poorly understood point is that your retrievability when recalling a random card at a random time – like when you need it in real life or on an exam – is _significantly higher than the desired retention_, as long as you stay more or less up to date on practicing your cards. That’s because the moment the scheduler puts a card in your practice queue is the moment you know it worst: your memory is now bad enough that you need a refresher, and once you get it, your memory will be much better again. A randomly selected card at a random time will, on average, be some time away from its next review, and thus have a higher retrievability. The math of actual moment-in-time retrievability is too complex for this article, but a good rule of thumb is that if your target retrievability is 90%, your actual retrievability on a random card at a random time is 95%.

​

- A card’s **stability** is how firmly the idea is stored in your memory. The higher a card’s stability, the slower its retrievability decreases over time. The more times you successfully recall a card, the higher its stability. Stability corresponds to a card’s _interval_ parameter in a spaced repetition system, i.e., the number of days before the retrievability drops below some desired value.


On the forgetting curve, the _y_-axis shows the retrievability at any given date. The stability (and other factors like how difficult the card is and what other related cards you’ve practiced) determines how quickly the curve drops off.

![A line graph titled 'The Forgetting Curve', plotting retention against days since the last review. The curve falls from 100 percent to about 50 percent within a day, then flattens out near 10 percent by day seven.](https://remnote.intercom-attachments-7.com/i/o/998768283/ad03f12e5764b57ffaacc7bb/T_xfe5uSdRaV-5LjYuKtb1Ao_kw6SvVuB3GUyQ5ocIKa6OHjNVSaDNTBeY9hjZlLHjXCf2ONVCd0eJTqCOv9WAISr1_D9zSK_8m8lDGkkxr-Rcw6nN2aWU0MFGKg88Rv3sj4Ub_RDnxImDMQ15uvS5M?expires=1788118200&signature=d8c8da9102a49a0170ba3979a1ea7b5c5c942fb662b5f33ddcc7eb99f5d8a404&req=fSkvEc92n4lcFb4f3HP0gGHPcauNSiFhMaSlD%2Fi8ZAqgBT7FGeNyZYxBiMSI%0A3lE2g77GPMjHWv%2FCiQ%3D%3D%0A)

# Changes made by the exam scheduler

First, understand that the Exam Scheduler is not a replacement for [another spaced-repetition scheduler](https://help.remnote.com/en/articles/6958056-custom-schedulers) like [Anki SM-2](https://help.remnote.com/en/articles/6026144-the-anki-sm-2-spaced-repetition-algorithm) or [FSRS](https://help.remnote.com/en/articles/9124137-the-fsrs-spaced-repetition-algorithm), but rather a complement to it. The main scheduler you have selected does most of the work, and the exam scheduler adds extra reviews or alters the parameters of the main scheduler as necessary.

Here are the changes it makes.

- **Final Review Period**(temporary increase in retrievability):On your exam date, you want your retrievability as high as possible. Maintaining, say, 98% constantly is impractical, but doing extra practice to reach a very high retrievability for the day of your exam is easy enough once you have a solid understanding of the cards. When the Final Review Period is enabled, we add one last review of every card just before your exam.

- **Learning Period:** Brand-new cards are forgotten fastest, since there's no stability behind them yet. During the Learning Period, a new card is repeated until you've recalled it successfully twice, which brings your retrievability back up near 100% before the main scheduler starts spacing it out over days. This step guarantees you fully comprehend the ideas before the algorithm begins testing your desired retention over longer intervals.

- **Ensure Mastery:** The cards you keep forgetting are the ones most likely to fail you on exam day. When you turn on \*Add extra practice for shaky cards\*, a card you get wrong doesn't simply return to the normal rotation: the scheduler brings it back sooner and asks for two successful recalls in a row before treating it as learned again. Your shakiest material gets concentrated practice, while cards you already know well are left alone.

- **Catch Up Period:** If you fall behind, the exam scheduler proposes an explicit Catch Up Period (a temporary increase to your daily goal) rather than quietly rearranging your schedule. By temporarily increasing your daily review goals, this window forces you to practice a higher volume of cards whose estimated retrievability has dropped below your target threshold.

- **Exam Daily Goal:** Instead of rescheduling cards in the background, the scheduler computes a daily goal for your exam from the practice you have coming up this week and the total practice remaining, and shows it as its own section in your [daily goal](https://help.remnote.com/en/articles/7950933-goals-and-streaks). **​**


Ready to ace your next exam? Check out [Preparing for an Exam](https://help.remnote.com/en/articles/9101991-preparing-for-an-exam) to learn how to use the exam scheduler.

* * *

Related Articles

- [Getting Started with Spaced Repetition](https://help.remnote.com/en/articles/6022755-getting-started-with-spaced-repetition)
- [RemNote vs. Anki, SuperMemo, and Other Spaced-Repetition Tools](https://help.remnote.com/en/articles/6025618-remnote-vs-anki-supermemo-and-other-spaced-repetition-tools)
- [The Anki SM-2 Spaced Repetition Algorithm](https://help.remnote.com/en/articles/6026144-the-anki-sm-2-spaced-repetition-algorithm)
- [Preparing for an Exam](https://help.remnote.com/en/articles/9101991-preparing-for-an-exam)
- [Understanding Spaced Repetition](https://help.remnote.com/en/articles/9337171-understanding-spaced-repetition)

Did this answer your question?

😞😐😃

Table of contents

[The problem](https://help.remnote.com/en/articles/9102040-understanding-the-exam-scheduler#h_ef3c866269)[Background](https://help.remnote.com/en/articles/9102040-understanding-the-exam-scheduler#h_767c240ad0)[Changes made by the exam scheduler](https://help.remnote.com/en/articles/9102040-understanding-the-exam-scheduler#h_cc77fdab7d)