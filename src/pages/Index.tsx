import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Globe,
  Briefcase,
  MapPin,
  Heart,
  Sparkles,
  ArrowRight,
  Zap,
  Shield,
  Eye,
  ChevronRight,
  Download,
  Star
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-pink-300/15 to-indigo-300/15 rounded-full blur-3xl animate-float stagger-2" />
        <div className="absolute -bottom-20 right-1/3 w-72 h-72 bg-gradient-to-br from-purple-300/20 to-blue-300/20 rounded-full blur-3xl animate-float stagger-4" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 opacity-0-initial animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl blur-lg opacity-50 animate-pulse-soft" />
              <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 p-2.5 rounded-xl">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold text-gray-900">Career Navigator</span>
          </div>
          <div className="flex items-center gap-4 opacity-0-initial animate-fade-in stagger-1">
            <Badge variant="secondary" className="px-3 py-1.5 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 transition-colors cursor-default">
              <Heart className="w-3.5 h-3.5 mr-1.5 fill-green-500 text-green-500" />
              Free Forever
            </Badge>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Floating badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-8 opacity-0-initial animate-fade-in-down">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700">AI-Powered Job Analysis</span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 opacity-0-initial animate-fade-in-up stagger-1">
            <span className="text-gray-900">Find Jobs With </span>
            <span className="gradient-text">Relocation</span>
            <br />
            <span className="text-gray-900">Support Instantly</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed opacity-0-initial animate-fade-in-up stagger-2">
            A Chrome extension that automatically detects relocation assistance, visa sponsorship,
            and job types from postings across major job platforms.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 opacity-0-initial animate-fade-in-up stagger-3">
            <Button
              size="lg"
              className="group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-2xl shadow-lg shadow-indigo-500/25 btn-smooth hover-glow"
              onClick={() => document.getElementById('install')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Download className="w-5 h-5 mr-2 group-hover:animate-bounce-soft" />
              Install Extension
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-6 text-lg rounded-2xl border-2 hover:bg-gray-50 btn-smooth"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
            </Button>
          </div>

          {/* Platform badges */}
          <div className="flex flex-wrap justify-center gap-3 opacity-0-initial animate-fade-in-up stagger-4">
            {[
              { name: 'LinkedIn', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
              { name: 'Indeed', color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
              { name: 'Seek', color: 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100' },
              { name: 'Glassdoor', color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' },
            ].map((platform) => (
              <Badge
                key={platform.name}
                variant="outline"
                className={`px-4 py-2 text-sm font-medium ${platform.color} transition-all duration-200 hover:scale-105 cursor-default`}
              >
                <Globe className="w-3.5 h-3.5 mr-2" />
                {platform.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Hero visual - Floating cards preview */}
        <div className="relative mt-20 max-w-5xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-2xl" />
          <div className="relative glass rounded-3xl p-8 shadow-2xl shadow-indigo-500/10">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Sample indicator cards */}
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 card-hover opacity-0-initial animate-scale-in stagger-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="font-semibold text-gray-900">Relocation</span>
                </div>
                <p className="text-sm text-gray-600">Visa sponsorship available</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1.5 flex-1 bg-green-100 rounded-full overflow-hidden">
                    <div className="h-full w-4/5 bg-gradient-to-r from-green-400 to-green-600 rounded-full" />
                  </div>
                  <span className="text-xs font-medium text-green-600">95%</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 card-hover opacity-0-initial animate-scale-in stagger-2">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-semibold text-gray-900">Work Type</span>
                </div>
                <p className="text-sm text-gray-600">Hybrid - 2 days office</p>
                <div className="mt-3 flex gap-2">
                  <Badge className="bg-blue-50 text-blue-700 border-0 text-xs">Hybrid</Badge>
                  <Badge className="bg-gray-50 text-gray-600 border-0 text-xs">Flexible</Badge>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 card-hover opacity-0-initial animate-scale-in stagger-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <Briefcase className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="font-semibold text-gray-900">Contract</span>
                </div>
                <p className="text-sm text-gray-600">Permanent, Full-time</p>
                <div className="mt-3 flex gap-2">
                  <Badge className="bg-purple-50 text-purple-700 border-0 text-xs">Permanent</Badge>
                  <Badge className="bg-indigo-50 text-indigo-700 border-0 text-xs">Full-time</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <Badge variant="outline" className="px-4 py-2 mb-6 bg-white border-indigo-200 text-indigo-700">
            <Zap className="w-3.5 h-3.5 mr-2" />
            Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to streamline your job search and save hours of manual research
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: CheckCircle,
              title: 'Smart Detection',
              description: 'AI-powered analysis identifies relocation packages, visa sponsorship, and moving allowances.',
              color: 'from-green-500 to-emerald-600',
              bgColor: 'bg-green-50',
              iconColor: 'text-green-600'
            },
            {
              icon: MapPin,
              title: 'Location Insights',
              description: 'Instantly know if jobs are remote, hybrid, or on-site without reading entire descriptions.',
              color: 'from-blue-500 to-indigo-600',
              bgColor: 'bg-blue-50',
              iconColor: 'text-blue-600'
            },
            {
              icon: Eye,
              title: 'Visual Badges',
              description: 'Clear, non-intrusive indicators appear directly on job listings for quick scanning.',
              color: 'from-purple-500 to-pink-600',
              bgColor: 'bg-purple-50',
              iconColor: 'text-purple-600'
            },
            {
              icon: Zap,
              title: 'Instant Analysis',
              description: 'Results appear within seconds as you browse, no manual action required.',
              color: 'from-amber-500 to-orange-600',
              bgColor: 'bg-amber-50',
              iconColor: 'text-amber-600'
            },
            {
              icon: Shield,
              title: 'Privacy First',
              description: 'All analysis happens locally. Your job search data never leaves your browser.',
              color: 'from-cyan-500 to-blue-600',
              bgColor: 'bg-cyan-50',
              iconColor: 'text-cyan-600'
            },
            {
              icon: Star,
              title: 'Always Updated',
              description: 'Regular updates ensure compatibility with the latest job platform changes.',
              color: 'from-rose-500 to-pink-600',
              bgColor: 'bg-rose-50',
              iconColor: 'text-rose-600'
            }
          ].map((feature, i) => (
            <Card
              key={feature.title}
              className={`group border-0 shadow-lg hover:shadow-2xl bg-white/80 backdrop-blur-sm card-hover opacity-0-initial animate-fade-in-up stagger-${(i % 3) + 1}`}
            >
              <CardHeader className="pb-4">
                <div className={`w-14 h-14 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <Badge variant="outline" className="px-4 py-2 mb-6 bg-white border-purple-200 text-purple-700">
            <Sparkles className="w-3.5 h-3.5 mr-2" />
            How It Works
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple Setup, Instant Results
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get started in under a minute and transform your job search experience
          </p>
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 -translate-y-1/2" />

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: '01',
                title: 'Install Extension',
                description: 'Add Career Navigator to Chrome with one click from the extension page.',
                gradient: 'from-indigo-500 to-indigo-600'
              },
              {
                step: '02',
                title: 'Browse Jobs',
                description: 'Visit LinkedIn, Indeed, Seek or other supported job platforms as usual.',
                gradient: 'from-purple-500 to-purple-600'
              },
              {
                step: '03',
                title: 'See Insights',
                description: 'Watch as relocation and job type badges appear automatically on listings.',
                gradient: 'from-pink-500 to-pink-600'
              }
            ].map((item, i) => (
              <div
                key={item.step}
                className={`relative text-center opacity-0-initial animate-fade-in-up stagger-${i + 1}`}
              >
                <div className="relative inline-flex mb-6">
                  <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} rounded-2xl blur-xl opacity-30 animate-pulse-soft`} />
                  <div className={`relative bg-gradient-to-r ${item.gradient} text-white text-2xl font-bold w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg`}>
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="install" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />

          <div className="relative px-8 py-16 md:py-20 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 opacity-0-initial animate-fade-in-up">
              Ready to Simplify Your Job Search?
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto opacity-0-initial animate-fade-in-up stagger-1">
              Join thousands of job seekers who save hours each week with automated job analysis
            </p>

            {/* Installation steps */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mb-10">
              {[
                'Open chrome://extensions/',
                'Enable Developer mode',
                'Click "Load unpacked"',
                'Select extension folder'
              ].map((step, i) => (
                <div
                  key={step}
                  className={`flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-left opacity-0-initial animate-fade-in-up stagger-${i + 2}`}
                >
                  <div className="flex-shrink-0 w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                    {i + 1}
                  </div>
                  <span className="text-white/90 text-sm">{step}</span>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              variant="secondary"
              className="group bg-white hover:bg-gray-50 text-indigo-600 px-8 py-6 text-lg rounded-2xl shadow-xl btn-smooth opacity-0-initial animate-fade-in-up stagger-6"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Get Started Now
              <ChevronRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 text-sm">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-xl">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-gray-700">Career Navigator</span>
          </div>
          <p>Built for job seekers worldwide</p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">v1.0.0</Badge>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
