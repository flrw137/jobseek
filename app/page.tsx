"use client";

import React from "react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg">
                <span className="text-lg font-bold">J</span>
              </div>
              <span className="text-sm font-semibold uppercase tracking-wider text-text-primary">
                JobPilot
              </span>
            </div>

            <div className="flex items-center gap-8">
              <a
                href="#"
                className="text-sm font-medium text-text-secondary transition hover:text-text-primary"
              >
                Dashboard
              </a>
              <a
                href="#"
                className="text-sm font-medium text-text-secondary transition hover:text-text-primary"
              >
                Find Jobs
              </a>
              <a
                href="#"
                className="text-sm font-medium text-text-secondary transition hover:text-text-primary"
              >
                Profile
              </a>
              <button className="rounded-full bg-accent px-6 py-2 text-sm font-semibold text-accent-foreground shadow-lg transition hover:bg-accent-dark">
                Start for free
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="border-b border-border bg-surface py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-6 text-5xl font-bold text-text-primary">
              Your AI Job Hunting Assistant
            </h1>
            <p className="mb-12 text-lg text-text-secondary">
              Let AI find the perfect role for you. Discover jobs that match your
              skills, research companies, and apply with confidence.
            </p>
            <div className="flex gap-4 justify-center">
              <button className="rounded-full bg-accent px-8 py-3 font-semibold text-accent-foreground shadow-lg transition hover:bg-accent-dark">
                Get Started
              </button>
              <button className="rounded-full border-2 border-accent px-8 py-3 font-semibold text-accent transition hover:bg-accent-light">
                Find Your First Match
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-b border-border bg-background py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <h2 className="mb-16 text-center text-4xl font-bold text-text-primary">
            How It Works
          </h2>
          <div className="grid gap-12 md:grid-cols-3">
            {[
              {
                title: "Set Up Your Profile",
                description: "Upload your resume and let AI extract your skills and experience automatically.",
              },
              {
                title: "AI Discovers Jobs",
                description: "Our agent searches across thousands of jobs and scores each one against your profile.",
              },
              {
                title: "Research & Apply",
                description: "Get deep company insights and apply with confidence to roles that match you.",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border bg-surface p-8"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-light text-accent">
                  <span className="text-xl font-bold">{idx + 1}</span>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-text-primary">
                  {feature.title}
                </h3>
                <p className="text-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-b border-border bg-surface py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <h2 className="mb-16 text-center text-4xl font-bold text-text-primary">
            Powerful Features
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            {[
              {
                title: "Smart Job Matching",
                description: "AI scores every job 0-100 based on your actual skills and experience.",
              },
              {
                title: "Company Research",
                description: "Automated research on company culture, tech stack, and why roles exist.",
              },
              {
                title: "Resume Management",
                description: "Upload, extract, or generate professional resumes in seconds.",
              },
              {
                title: "Real-Time Analytics",
                description: "Track your job search with detailed stats and activity logs.",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="flex gap-4 rounded-2xl border border-border bg-surface-secondary p-6"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-success-light text-success">
                  ✓
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-text-primary">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-text-secondary">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-b border-border bg-background py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <h2 className="mb-16 text-center text-4xl font-bold text-text-primary">
            What Users Say
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                name: "Sarah Chen",
                role: "Frontend Engineer",
                quote: "Found my dream role in 2 weeks. JobPilot saved me hours of research.",
              },
              {
                name: "James Rodriguez",
                role: "Full Stack Developer",
                quote: "The company research feature gave me so much confidence in my interviews.",
              },
              {
                name: "Emily Watson",
                role: "Product Manager",
                quote: "Finally, a tool that understands my background. Highly recommended!",
              },
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border bg-surface p-8"
              >
                <div className="mb-4 flex gap-1 text-lg text-warning">
                  {"★★★★★"}
                </div>
                <p className="mb-6 text-text-secondary">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-text-primary">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-text-muted">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-b border-border bg-surface py-20">
        <div className="mx-auto max-w-2xl px-6 text-center lg:px-8">
          <h2 className="mb-6 text-4xl font-bold text-text-primary">
            Ready to Find Your Next Role?
          </h2>
          <p className="mb-12 text-lg text-text-secondary">
            Join hundreds of job seekers who are finding better opportunities faster
            with JobPilot.
          </p>
          <button className="rounded-full bg-accent px-8 py-4 font-semibold text-accent-foreground shadow-lg transition hover:bg-accent-dark">
            Start Your Free Trial
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background py-12">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mb-8 grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 font-semibold text-text-primary">Product</h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li><a href="#" className="hover:text-text-primary">Features</a></li>
                <li><a href="#" className="hover:text-text-primary">Pricing</a></li>
                <li><a href="#" className="hover:text-text-primary">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-text-primary">Company</h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li><a href="#" className="hover:text-text-primary">About</a></li>
                <li><a href="#" className="hover:text-text-primary">Blog</a></li>
                <li><a href="#" className="hover:text-text-primary">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-text-primary">Legal</h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li><a href="#" className="hover:text-text-primary">Privacy</a></li>
                <li><a href="#" className="hover:text-text-primary">Terms</a></li>
                <li><a href="#" className="hover:text-text-primary">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-text-primary">Follow</h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li><a href="#" className="hover:text-text-primary">Twitter</a></li>
                <li><a href="#" className="hover:text-text-primary">LinkedIn</a></li>
                <li><a href="#" className="hover:text-text-primary">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-text-muted">
            <p>&copy; 2026 JobPilot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

