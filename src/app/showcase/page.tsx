'use client';

import { useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ArrowRight,
  Users,
  Lock,
  Coins,
  Workflow,
  Building,
  Palette,
  Code,
  Handshake,
  CheckCircle2,
  TrendingUp,
  Zap,
  Shield,
  Globe,
  ChevronDown,
} from 'lucide-react';
import showcaseData from '@/data/showcase.json';
import Link from 'next/link';

export default function ShowcasePage() {
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'problem', 'solution', 'protocols', 'usecases', 'benefits', 'enhancements'];
      const current = sections.find((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) {
        // Active section tracking (can be used for analytics or highlighting)
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const iconMap = {
    users: Users,
    lock: Lock,
    coins: Coins,
    workflow: Workflow,
    building: Building,
    palette: Palette,
    code: Code,
    handshake: Handshake,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-0">
        {/* Hero Section */}
        <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent-yellow/5 to-accent-green/5" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <div className="animate-fade-in">
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-display font-bold mb-6 bg-gradient-to-r from-primary via-accent-yellow to-accent-green bg-clip-text text-transparent">
                {showcaseData.hero.title}
              </h1>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-semibold text-text-primary mb-8">
                {showcaseData.hero.subtitle}
              </h2>
              <p className="text-xl sm:text-2xl text-text-secondary max-w-4xl mx-auto mb-12 leading-relaxed">
                {showcaseData.hero.tagline}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              {showcaseData.hero.stats.map((stat, index) => (
                <Card
                  key={index}
                  variant="elevated"
                  className={`animate-fade-in stagger-${index + 1} hover:scale-105 transition-transform duration-300`}
                >
                  <div className="text-5xl font-display font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-lg font-semibold text-text-primary mb-1">{stat.label}</div>
                  <div className="text-sm text-text-secondary">{stat.description}</div>
                </Card>
              ))}
            </div>

            {/* Scroll Indicator */}
            <button
              onClick={() => scrollToSection('problem')}
              className="animate-bounce inline-flex flex-col items-center text-text-secondary hover:text-primary transition-colors"
            >
              <span className="text-sm mb-2">Explore</span>
              <ChevronDown className="w-6 h-6" />
            </button>
          </div>
        </section>

        {/* Problem Section */}
        <section id="problem" className="py-24 bg-surface">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-display font-bold text-text-primary mb-4">{showcaseData.problem.title}</h2>
              <div className="text-4xl font-bold text-accent-red mb-2">{showcaseData.problem.impact}</div>
              <p className="text-xl text-text-secondary">{showcaseData.problem.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {showcaseData.problem.challenges.map((challenge, index) => {
                const Icon = iconMap[challenge.icon as keyof typeof iconMap];
                return (
                  <Card key={index} variant="elevated" className="group hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-accent-red/10 rounded-xl flex items-center justify-center group-hover:bg-accent-red/20 transition-colors">
                        <Icon className="w-6 h-6 text-accent-red" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-text-primary mb-2">{challenge.title}</h3>
                        <p className="text-text-secondary">{challenge.description}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <Card variant="elevated" className="bg-gradient-to-r from-primary/10 to-accent-yellow/10 border-primary/20">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-primary mb-1">Job To Be Done</div>
                  <p className="text-lg text-text-primary font-medium">{showcaseData.problem.jobToBeDone}</p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Solution Section */}
        <section id="solution" className="py-24 bg-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-display font-bold text-text-primary mb-4">
                {showcaseData.solution.title}
              </h2>
              <p className="text-xl text-text-secondary">{showcaseData.solution.subtitle}</p>
            </div>

            <div className="relative">
              {/* Connecting Line */}
              <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent-yellow to-accent-green transform -translate-x-1/2" />

              {/* Flow Steps */}
              <div className="space-y-12">
                {showcaseData.solution.flow.map((step, index) => {
                  const isEven = index % 2 === 0;
                  const colorClasses = {
                    indigo: 'from-primary/20 to-primary/5 border-primary/30',
                    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30',
                    yellow: 'from-accent-yellow/20 to-accent-yellow/5 border-accent-yellow/30',
                    green: 'from-accent-green/20 to-accent-green/5 border-accent-green/30',
                  };

                  return (
                    <div
                      key={index}
                      className={`relative flex items-center ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
                    >
                      {/* Step Number Circle */}
                      <div className="absolute left-1/2 transform -translate-x-1/2 w-16 h-16 bg-surface border-4 border-primary rounded-full flex items-center justify-center z-10 shadow-lg hidden lg:flex">
                        <span className="text-2xl font-bold text-primary">{step.step}</span>
                      </div>

                      {/* Content Card */}
                      <div className={`w-full lg:w-5/12 ${isEven ? 'lg:pr-12' : 'lg:pl-12'}`}>
                        <Card
                          variant="elevated"
                          className={`bg-gradient-to-br ${
                            colorClasses[step.color as keyof typeof colorClasses]
                          } hover:scale-105 transition-transform duration-300`}
                        >
                          <div className="flex items-center space-x-3 mb-4 lg:hidden">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-lg font-bold text-primary-foreground">{step.step}</span>
                            </div>
                            <h3 className="text-2xl font-bold text-text-primary">{step.title}</h3>
                          </div>
                          <h3 className="hidden lg:block text-2xl font-bold text-text-primary mb-3">{step.title}</h3>
                          <p className="text-text-secondary mb-4">{step.description}</p>
                          <div className="bg-surface/50 rounded-lg p-3 font-mono text-sm text-primary">
                            {step.example}
                          </div>
                        </Card>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Protocols Section */}
        <section id="protocols" className="py-24 bg-surface">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-display font-bold text-text-primary mb-4">
                {showcaseData.protocols.title}
              </h2>
              <p className="text-xl text-text-secondary">{showcaseData.protocols.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {showcaseData.protocols.integrations.map((protocol, index) => (
                <Card
                  key={index}
                  variant="elevated"
                  padding="lg"
                  className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                >
                  <div className="text-center mb-6">
                    <div className="inline-flex w-16 h-16 bg-gradient-to-br from-primary/20 to-accent-yellow/20 rounded-2xl items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Globe className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-text-primary mb-2">{protocol.name}</h3>
                    <p className="text-text-secondary font-medium">{protocol.description}</p>
                  </div>

                  <div className="space-y-3 mb-6">
                    {protocol.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-5 h-5 text-accent-green flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-text-secondary">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-border">
                    <div className="text-xs font-semibold text-text-tertiary mb-1">INFRASTRUCTURE TYPE</div>
                    <div className="text-sm text-text-secondary mb-2">{protocol.track}</div>
                    <div className="text-lg font-bold text-primary">{protocol.amount}</div>
                  </div>
                </Card>
              ))}
            </div>

            <Card variant="elevated" className="bg-gradient-to-r from-primary/10 to-accent-green/10 border-primary/20">
              <div className="text-center">
                <p className="text-lg font-semibold text-primary">
                  {showcaseData.protocols.advantage}
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* Use Cases Section */}
        <section id="usecases" className="py-24 bg-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-display font-bold text-text-primary mb-4">
                {showcaseData.useCases.title}
              </h2>
              <p className="text-xl text-text-secondary">{showcaseData.useCases.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {showcaseData.useCases.cases.map((useCase, index) => {
                const Icon = iconMap[useCase.icon as keyof typeof iconMap];
                return (
                  <Card
                    key={index}
                    variant="elevated"
                    className="group hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-text-primary mb-2">{useCase.title}</h3>
                        <p className="text-text-secondary">{useCase.description}</p>
                      </div>
                    </div>

                    <div className="space-y-2 pl-16">
                      {useCase.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-accent-green rounded-full" />
                          <span className="text-sm text-text-secondary">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-24 bg-surface">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-display font-bold text-text-primary mb-4">
                {showcaseData.benefits.title}
              </h2>
              <p className="text-2xl text-primary font-semibold">{showcaseData.benefits.headline}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Before */}
              <Card variant="elevated" className="bg-gradient-to-br from-accent-red/5 to-accent-red/10 border-accent-red/20">
                <div className="text-center mb-6">
                  <div className="inline-flex px-4 py-2 bg-accent-red/10 rounded-full mb-4">
                    <span className="text-sm font-semibold text-accent-red">
                      {showcaseData.benefits.comparison.before.title}
                    </span>
                  </div>
                  <p className="text-lg text-text-primary font-medium">
                    {showcaseData.benefits.comparison.before.description}
                  </p>
                </div>
                <div className="space-y-3">
                  {showcaseData.benefits.comparison.before.drawbacks.map((drawback, idx) => (
                    <div key={idx} className="flex items-start space-x-3 p-3 bg-surface rounded-lg">
                      <div className="w-5 h-5 text-accent-red flex-shrink-0 mt-0.5">✕</div>
                      <span className="text-text-secondary">{drawback}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* After */}
              <Card variant="elevated" className="bg-gradient-to-br from-accent-green/5 to-accent-green/10 border-accent-green/20">
                <div className="text-center mb-6">
                  <div className="inline-flex px-4 py-2 bg-accent-green/10 rounded-full mb-4">
                    <span className="text-sm font-semibold text-accent-green">
                      {showcaseData.benefits.comparison.after.title}
                    </span>
                  </div>
                  <p className="text-lg text-text-primary font-medium">
                    {showcaseData.benefits.comparison.after.description}
                  </p>
                </div>
                <div className="space-y-3">
                  {showcaseData.benefits.comparison.after.advantages.map((advantage, idx) => (
                    <div key={idx} className="flex items-start space-x-3 p-3 bg-surface rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-accent-green flex-shrink-0 mt-0.5" />
                      <span className="text-text-secondary">{advantage}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Enhancements Section */}
        <section id="enhancements" className="py-24 bg-surface">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-display font-bold text-text-primary mb-4">
                {showcaseData.enhancements.title}
              </h2>
              <p className="text-xl text-text-secondary">{showcaseData.enhancements.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {showcaseData.enhancements.features.map((feature, index) => {
                const impactColors = {
                  high: 'from-primary/10 to-primary/5 border-primary/30',
                  medium: 'from-accent-yellow/10 to-accent-yellow/5 border-accent-yellow/30',
                  low: 'from-accent-green/10 to-accent-green/5 border-accent-green/30',
                };

                const complexityIcons = {
                  low: <Zap className="w-4 h-4" />,
                  medium: <TrendingUp className="w-4 h-4" />,
                  high: <Shield className="w-4 h-4" />,
                };

                return (
                  <Card
                    key={index}
                    variant="elevated"
                    className={`bg-gradient-to-br ${impactColors[feature.impact as keyof typeof impactColors]} hover:shadow-xl transition-shadow`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-xl font-bold text-text-primary">{feature.name}</h3>
                        </div>
                        <div className="inline-block px-2 py-1 bg-primary/10 rounded text-xs font-semibold text-primary mb-3">
                          {feature.category}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <div className="flex items-center space-x-1 text-xs text-text-tertiary">
                          {complexityIcons[feature.complexity as keyof typeof complexityIcons]}
                          <span className="capitalize">{feature.complexity}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-text-secondary mb-4">{feature.description}</p>
                    <div className="space-y-2">
                      {feature.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-accent-green flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-text-secondary">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-primary/10 via-accent-yellow/10 to-accent-green/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-display font-bold text-text-primary mb-6">
              Ready to Experience Instant Payments?
            </h2>
            <p className="text-xl text-text-secondary mb-8">
              Join thousands using FlashPay ENS for gasless, instant payments
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/">
                <Button size="lg" className="group">
                  Try FlashPay Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
