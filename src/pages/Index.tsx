
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Globe, Briefcase, MapPin, Heart } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <div className="flex justify-center items-center mb-6">
              <div className="bg-blue-600 p-4 rounded-full shadow-lg">
                <Briefcase className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Career Navigator
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Chrome extension that automatically identifies relocation assistance, job types, and key details 
              from job postings across LinkedIn, Indeed, Seek, and other major job sites.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Globe className="w-4 h-4 mr-2" />
                LinkedIn Support
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Globe className="w-4 h-4 mr-2" />
                Indeed Support
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Globe className="w-4 h-4 mr-2" />
                Seek Support
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Heart className="w-4 h-4 mr-2" />
                Free Forever
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Powerful Features for Job Seekers
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Save time and make informed decisions with our intelligent job analysis tool
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center">
              <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Relocation Detection</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Automatically identifies if a job offers relocation assistance, visa sponsorship, 
                or moving allowances from job descriptions.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center">
              <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Job Type Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Detects whether positions are remote, hybrid, on-site, contract, 
                or permanent roles instantly.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center">
              <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Visual Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Clear, non-intrusive badges appear on job pages showing relocation status 
                and job type at a glance.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            How It Works
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h4 className="font-semibold mb-2">Install Extension</h4>
              <p className="text-gray-600 text-sm">
                Add the Chrome extension to your browser in one click
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h4 className="font-semibold mb-2">Browse Jobs</h4>
              <p className="text-gray-600 text-sm">
                Visit any supported job site and view job postings as usual
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h4 className="font-semibold mb-2">See Results</h4>
              <p className="text-gray-600 text-sm">
                Automatic analysis appears with relocation and job type info
              </p>
            </div>
          </div>
        </div>

        {/* Installation Guide */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-lg mb-6 opacity-90">
            Load the extension files into Chrome and start analyzing job postings instantly
          </p>
          <div className="space-y-3 text-left max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <div className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">
                1
              </div>
              <p>Open Chrome and navigate to chrome://extensions/</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">
                2
              </div>
              <p>Enable "Developer mode" in the top right corner</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">
                3
              </div>
              <p>Click "Load unpacked" and select the extension folder</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">
                4
              </div>
              <p>Visit LinkedIn, Indeed, or Seek and start browsing jobs!</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 py-8">
          <p className="text-gray-600">
            Built with ❤️ for job seekers worldwide • Version 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
