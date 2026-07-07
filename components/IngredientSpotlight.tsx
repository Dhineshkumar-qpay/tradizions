'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChefHat, 
  HeartPulse, 
  Scale, 
  Activity, 
  Shield, 
  Brain, 
  Flame, 
  Droplets,
  Package,
  Clock,
  Utensils
} from 'lucide-react';

const INGREDIENTS = [
  {
    id: 'foxtail-millet',
    name: 'Foxtail Millet (Thinai)',
    icon: '🌾',
    shortDescription: 'Foxtail Millet is a timeless ancient grain, known for its sweet, nutty flavor and incredibly light texture. Cultivated organically and sun-dried to preserve its natural goodness, this gluten-free superfood is a powerhouse of dietary fiber, protein, and essential minerals. Unlike polished white rice, Foxtail Millet has a low glycemic index, making it a perfect choice for sustained energy throughout the day.',
    recipe: {
      title: 'Classic Vegetable Foxtail Millet Pulao',
      prepTime: '15 mins',
      cookTime: '20 mins',
      servings: 4,
      difficulty: 'Medium',
      ingredients: ['1 cup Foxtail Millet', '2.5 cups Water', '1 cup Mixed Vegetables', '1 tsp Ghee', '1 tsp Cumin Seeds', 'Salt to taste'],
      steps: [
        'Wash & Soak: Thoroughly wash 1 cup of Foxtail Millet. Soak for 15-20 mins.',
        'Sauté: Heat ghee. Add cumin seeds. Add chopped vegetables and sauté for 3-4 mins.',
        'Simmer: Drain millet and add to pan. Toast for 2 mins. Add water and salt.',
        'Cook: Bring to boil, reduce heat. Cover and simmer for 12-15 mins.',
        'Fluff: Let it rest for 5 mins. Gently fluff with a fork.'
      ]
    },
    nutrition: {
      Calories: '331 kcal',
      Protein: '12.3 g',
      Carbs: '60.2 g',
      Fiber: '8.0 g',
      Fat: '4.3 g',
      Calcium: '31 mg',
      Iron: '2.8 mg'
    },
    benefits: [
      { text: 'Heart Healthy: Rich in linoleic acid.', icon: <HeartPulse className="w-5 h-5 text-rose-500" /> },
      { text: 'Weight Management: High fiber keeps you full.', icon: <Scale className="w-5 h-5 text-emerald-500" /> },
      { text: 'Sugar Control: Low glycemic index.', icon: <Activity className="w-5 h-5 text-blue-500" /> }
    ],
    chefTips: [
      'Always soak the millet for at least 15 minutes to improve cooked texture.',
      'Toasting dry millet in a pan for 2 mins adds a deep nutty flavor.',
      'Use a 1:2.5 ratio of millet to water for a fluffy texture.'
    ],
    storage: 'Store in an airtight glass container in a cool, dark place. Shelf life is 6-8 months.'
  },
  {
    id: 'ragi',
    name: 'Finger Millet (Ragi)',
    icon: '🌱',
    shortDescription: 'Finger Millet, affectionately known as Ragi, is a deeply nutritious ancient grain characterized by its rich, earthy flavor and deep reddish-brown hue. Sourced directly from traditional organic farms, our Ragi is completely unpolished, retaining its massive calcium and iron content. Naturally gluten-free and easily digestible.',
    recipe: {
      title: 'Nourishing Sweet Ragi Porridge (Malt)',
      prepTime: '5 mins',
      cookTime: '10 mins',
      servings: 2,
      difficulty: 'Easy',
      ingredients: ['3 tbsp Ragi Flour', '1 cup Water', '1 cup Milk', '2 tsp Jaggery', 'Pinch of Cardamom'],
      steps: [
        'Mix: Form a smooth slurry with Ragi flour and 1/2 cup cold water.',
        'Boil: Bring remaining 1/2 cup of water to a boil.',
        'Whisk: Slowly pour slurry into boiling water while whisking continuously.',
        'Cook: Cook for 5-7 mins until thick and glossy.',
        'Finish: Stir in milk, jaggery, and cardamom. Simmer for 2 mins.'
      ]
    },
    nutrition: {
      Calories: '328 kcal',
      Protein: '7.3 g',
      Carbs: '72.0 g',
      Fiber: '11.5 g',
      Fat: '1.3 g',
      Calcium: '344 mg',
      Iron: '3.9 mg'
    },
    benefits: [
      { text: 'Bone Health: Highest calcium content (344mg).', icon: <Activity className="w-5 h-5 text-blue-500" /> },
      { text: 'Fights Anemia: Rich natural source of iron.', icon: <Droplets className="w-5 h-5 text-red-500" /> },
      { text: 'Energy Boosting: Sustained slow-release energy.', icon: <Flame className="w-5 h-5 text-orange-500" /> }
    ],
    chefTips: [
      'Mix flour with cold water first; hot water creates instant lumps.',
      'Sprouting Ragi increases bioavailability by over 30%.',
      'Mix with wheat flour (1:2) to make soft rotis.'
    ],
    storage: 'Keep flour in an airtight container away from sunlight. Refrigerate for up to 6 months.'
  },
  {
    id: 'almonds',
    name: 'California Almonds',
    icon: '🌰',
    shortDescription: 'Our Premium California Almonds are carefully selected for their large size, satisfying crunch, and rich buttery flavor. Completely raw, unroasted, and unsalted, these almonds retain 100% of their natural nutrients. Packed with Vitamin E, plant protein, and healthy monounsaturated fats.',
    recipe: {
      title: 'Activated (Overnight Soaked) Almonds',
      prepTime: '5 mins',
      cookTime: '12 hours (Soak)',
      servings: 1,
      difficulty: 'Very Easy',
      ingredients: ['10-12 Raw Almonds', 'Filtered Water'],
      steps: [
        'Rinse: Rinse under cold water.',
        'Soak: Cover almonds with filtered water in a glass bowl.',
        'Wait: Leave overnight (8 to 12 hours) at room temperature.',
        'Peel: Drain water. The brown skin will easily slip off.',
        'Consume: Eat first thing in the morning.'
      ]
    },
    nutrition: {
      Calories: '579 kcal',
      Protein: '21.2 g',
      Carbs: '21.6 g',
      Fiber: '12.5 g',
      Fat: '49.9 g',
      Calcium: '268 mg',
      Iron: '3.7 mg'
    },
    benefits: [
      { text: 'Brain Health: Rich in riboflavin & L-carnitine.', icon: <Brain className="w-5 h-5 text-purple-500" /> },
      { text: 'Glowing Skin: High natural Vitamin E.', icon: <HeartPulse className="w-5 h-5 text-rose-500" /> },
      { text: 'Muscle Recovery: Rich in plant protein.', icon: <Shield className="w-5 h-5 text-emerald-500" /> }
    ],
    chefTips: [
      'Soaking removes phytic acid, improving nutrient absorption.',
      'Toast in a dry skillet for 3-5 mins to enhance crunch.',
      'Blend soaked almonds with water for instant almond milk.'
    ],
    storage: 'Store raw in a sealed container in the fridge (1 year) or freezer (2 years).'
  },
  {
    id: 'black-pepper',
    name: 'Whole Black Pepper',
    icon: '🍯',
    shortDescription: 'Known as the "King of Spices," our Whole Black Pepper is organically grown. Sun-dried to a deep hue, these bold peppercorns deliver an intense, woody aroma. It is packed with piperine, which drastically improves the absorption of other nutrients.',
    recipe: {
      title: 'Golden Immunity Milk (Haldi Doodh)',
      prepTime: '2 mins',
      cookTime: '5 mins',
      servings: 1,
      difficulty: 'Easy',
      ingredients: ['1 cup Milk', '1/2 tsp Turmeric', '3-4 Whole Black Peppercorns', '1 tsp Honey'],
      steps: [
        'Crush: Freshly crush 3-4 whole black peppercorns.',
        'Heat: Warm the milk over medium heat.',
        'Infuse: Whisk in turmeric and crushed pepper. Simmer for 3 mins.',
        'Serve: Pour into a mug, stir in honey once slightly cooled.'
      ]
    },
    nutrition: {
      Calories: '251 kcal',
      Protein: '10.4 g',
      Carbs: '64.0 g',
      Fiber: '25.3 g',
      Fat: '3.3 g',
      Calcium: '443 mg',
      Iron: '9.7 mg'
    },
    benefits: [
      { text: 'Enhances Absorption: Boosts curcumin uptake by 2000%.', icon: <Activity className="w-5 h-5 text-blue-500" /> },
      { text: 'Improves Digestion: Stimulates stomach acid.', icon: <Flame className="w-5 h-5 text-orange-500" /> },
      { text: 'Respiratory Relief: Naturally clears congestion.', icon: <Droplets className="w-5 h-5 text-cyan-500" /> }
    ],
    chefTips: [
      'Always buy whole peppercorns and grind fresh.',
      'Add pepper at the end of cooking to preserve flavor.',
      'Pair with turmeric in curries to unlock anti-inflammatory benefits.'
    ],
    storage: 'Keep in a tightly sealed glass jar in a cool, dry pantry for up to 3 years.'
  }
];

export default function IngredientSpotlight() {
  const [activeId, setActiveId] = useState(INGREDIENTS[0].id);

  const activeIngredient = INGREDIENTS.find(i => i.id === activeId)!;

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif text-amber-950 mb-4">Ingredient Spotlight</h2>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Explore deep dives into our core organic products. Discover how to cook them, their nutritional profiles, and expert chef tips.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4 space-y-3">
            {INGREDIENTS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveId(item.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl text-left transition-all duration-300 ${
                  activeId === item.id 
                    ? 'bg-amber-900 text-white shadow-lg shadow-amber-900/20' 
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </div>
                {activeId === item.id && <ChevronRight className="w-5 h-5" />}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="lg:w-3/4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="bg-stone-50 rounded-3xl p-8 border border-stone-100"
              >
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-5xl">{activeIngredient.icon}</span>
                  <h3 className="text-3xl font-serif text-amber-950">{activeIngredient.name}</h3>
                </div>
                
                <p className="text-stone-600 leading-relaxed mb-10 text-lg">
                  {activeIngredient.shortDescription}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  
                  {/* Left Column */}
                  <div className="space-y-8">
                    {/* Cooking Guide */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                      <h4 className="text-lg font-serif text-amber-900 mb-4 flex items-center gap-2">
                        <Utensils className="w-5 h-5" /> Recommended Prep
                      </h4>
                      <p className="font-medium text-stone-800 mb-3">{activeIngredient.recipe.title}</p>
                      <div className="flex gap-4 text-sm text-stone-500 mb-5">
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {activeIngredient.recipe.prepTime}</span>
                        <span className="flex items-center gap-1"><Flame className="w-4 h-4"/> {activeIngredient.recipe.cookTime}</span>
                      </div>
                      <div className="space-y-3">
                        {activeIngredient.recipe.steps.map((step, idx) => {
                          const [title, desc] = step.split(': ');
                          return (
                            <div key={idx} className="flex gap-3 text-sm">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                                {idx + 1}
                              </span>
                              <p className="text-stone-600"><strong className="text-stone-800">{title}:</strong> {desc}</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Storage Guide */}
                    <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                      <h4 className="text-lg font-serif text-amber-900 mb-3 flex items-center gap-2">
                        <Package className="w-5 h-5" /> Storage Guide
                      </h4>
                      <p className="text-sm text-amber-800 leading-relaxed">{activeIngredient.storage}</p>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-8">
                    {/* Health Benefits */}
                    <div>
                      <h4 className="text-lg font-serif text-amber-900 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5" /> Core Health Benefits
                      </h4>
                      <div className="space-y-3">
                        {activeIngredient.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-stone-100 shadow-sm">
                            <div className="p-2 bg-stone-50 rounded-lg">{benefit.icon}</div>
                            <span className="text-sm text-stone-700 font-medium">{benefit.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Nutrition Facts */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                      <h4 className="text-lg font-serif text-amber-900 mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5" /> Nutrition (per 100g)
                      </h4>
                      <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                        {Object.entries(activeIngredient.nutrition).map(([key, val]) => (
                          <div key={key} className="flex justify-between border-b border-stone-50 pb-1">
                            <span className="text-stone-500">{key}</span>
                            <span className="font-medium text-stone-800">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Chef Tips */}
                    <div>
                      <h4 className="text-lg font-serif text-amber-900 mb-4 flex items-center gap-2">
                        <ChefHat className="w-5 h-5" /> Chef's Secrets
                      </h4>
                      <ul className="space-y-2">
                        {activeIngredient.chefTips.map((tip, idx) => (
                          <li key={idx} className="text-sm text-stone-600 flex gap-2">
                            <span className="text-lime-600">•</span> {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
