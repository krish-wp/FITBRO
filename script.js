
// HealthSolve Pro - Premium Health Problem Solver App
// Advanced LocalStorage with encryption simulation
function save(key, data) {
  try {
    const encrypted = btoa(JSON.stringify(data)); // Basic encoding simulation
    localStorage.setItem(key, encrypted);
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}

function load(key) {
  try {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return [];
    return JSON.parse(atob(encrypted));
  } catch (e) {
    console.error('Failed to load data:', e);
    return [];
  }
}

// Premium Features Management
let isPremiumUser = localStorage.getItem('premiumUser') === 'true';
let premiumTrialUsed = localStorage.getItem('premiumTrialUsed') === 'true';

// Health Data Storage
let healthData = {
  workouts: load('workouts'),
  foods: load('foods'),
  water: Number(localStorage.getItem('waterCount')) || 0,
  weights: load('weights'),
  sleep: load('sleep'),
  symptoms: load('symptoms'),
  bmi: load('bmi'),
  bodyComposition: load('bodyComposition'),
  aiChats: load('aiChats')
};

// AI Health Assistant
const healthKnowledgeBase = {
  symptoms: {
    'headache': {
      causes: ['Stress', 'Dehydration', 'Poor sleep', 'Eye strain'],
      recommendations: ['Drink more water', 'Get adequate sleep', 'Manage stress', 'Take breaks from screens'],
      severity: 'mild'
    },
    'fatigue': {
      causes: ['Poor sleep', 'Iron deficiency', 'Stress', 'Poor nutrition'],
      recommendations: ['Improve sleep schedule', 'Eat iron-rich foods', 'Exercise regularly', 'Manage stress'],
      severity: 'mild'
    },
    'chest pain': {
      causes: ['Serious medical condition'],
      recommendations: ['Seek immediate medical attention'],
      severity: 'severe'
    },
    'shortness of breath': {
      causes: ['Serious medical condition'],
      recommendations: ['Seek immediate medical attention'],
      severity: 'severe'
    }
  },
  
  workoutRecommendations: {
    beginner: ['Walking', 'Basic bodyweight exercises', 'Light stretching'],
    intermediate: ['Jogging', 'Weight training', 'HIIT workouts'],
    advanced: ['Running', 'Heavy lifting', 'Complex HIIT', 'Sports training']
  },
  
  nutritionAdvice: {
    weightLoss: {
      calories: -500,
      macros: { protein: 30, carbs: 40, fat: 30 },
      foods: ['Lean proteins', 'Vegetables', 'Whole grains', 'Healthy fats']
    },
    muscleGain: {
      calories: 300,
      macros: { protein: 35, carbs: 45, fat: 20 },
      foods: ['Protein-rich foods', 'Complex carbs', 'Nuts', 'Dairy']
    },
    maintenance: {
      calories: 0,
      macros: { protein: 25, carbs: 50, fat: 25 },
      foods: ['Balanced diet', 'Variety of nutrients', 'Adequate hydration']
    }
  }
};

// AI Health Assistant Functions
function sendAIMessage() {
  const input = document.getElementById('aiInput');
  const message = input.value.trim();
  
  if (!message) return;
  
  if (!isPremiumUser) {
    showPremiumModal();
    return;
  }
  
  addAIMessage('user', message);
  input.value = '';
  
  // Show typing indicator
  addAIMessage('ai', 'Analyzing your query...', true);
  
  setTimeout(() => {
    removeTypingIndicator();
    const response = generateAIResponse(message);
    addAIMessage('ai', response);
    
    // Save conversation
    healthData.aiChats.push({
      timestamp: new Date().toISOString(),
      userMessage: message,
      aiResponse: response
    });
    save('aiChats', healthData.aiChats);
  }, 2000);
}

function addAIMessage(sender, message, isTyping = false) {
  const messagesContainer = document.getElementById('aiMessages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `ai-message ${sender}-message ${isTyping ? 'typing' : ''}`;
  
  if (sender === 'user') {
    messageDiv.innerHTML = `
      <div class="user-avatar">👤</div>
      <div class="message-content">
        <p>${message}</p>
      </div>
    `;
  } else {
    messageDiv.innerHTML = `
      <div class="ai-avatar">🤖</div>
      <div class="message-content">
        <p>${message}</p>
        ${isTyping ? '<div class="typing-dots"><span></span><span></span><span></span></div>' : ''}
      </div>
    `;
  }
  
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingIndicator() {
  const typingMessage = document.querySelector('.typing');
  if (typingMessage) {
    typingMessage.remove();
  }
}

function generateAIResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  // Symptom analysis
  if (lowerMessage.includes('symptom') || lowerMessage.includes('pain') || lowerMessage.includes('feel')) {
    return analyzeSymptoms(message);
  }
  
  // Workout advice
  if (lowerMessage.includes('workout') || lowerMessage.includes('exercise') || lowerMessage.includes('fitness')) {
    return generateWorkoutAdvice();
  }
  
  // Nutrition advice
  if (lowerMessage.includes('food') || lowerMessage.includes('diet') || lowerMessage.includes('nutrition')) {
    return generateNutritionAdvice();
  }
  
  // Weight management
  if (lowerMessage.includes('weight') || lowerMessage.includes('lose') || lowerMessage.includes('gain')) {
    return generateWeightAdvice(message);
  }
  
  // Sleep advice
  if (lowerMessage.includes('sleep') || lowerMessage.includes('tired') || lowerMessage.includes('insomnia')) {
    return generateSleepAdvice();
  }
  
  // General health advice
  return generateGeneralHealthAdvice();
}

function analyzeSymptoms(message) {
  const symptoms = Object.keys(healthKnowledgeBase.symptoms);
  const foundSymptoms = symptoms.filter(symptom => 
    message.toLowerCase().includes(symptom)
  );
  
  if (foundSymptoms.length === 0) {
    return "I understand you're experiencing symptoms. For a proper diagnosis, I recommend consulting with a healthcare professional. In the meantime, ensure you're getting adequate rest, staying hydrated, and eating nutritious foods.";
  }
  
  const symptom = foundSymptoms[0];
  const symptomData = healthKnowledgeBase.symptoms[symptom];
  
  if (symptomData.severity === 'severe') {
    return `⚠️ Based on your symptoms, I strongly recommend seeking immediate medical attention. Please contact a healthcare provider or emergency services if this is urgent.`;
  }
  
  return `Based on your symptoms, here are some potential causes and recommendations:

🔍 **Possible Causes:**
${symptomData.causes.map(cause => `• ${cause}`).join('\n')}

💡 **Recommendations:**
${symptomData.recommendations.map(rec => `• ${rec}`).join('\n')}

⚠️ **Important:** This is general information only. If symptoms persist or worsen, please consult a healthcare professional.`;
}

function generateWorkoutAdvice() {
  const recentWorkouts = healthData.workouts.slice(-7); // Last 7 workouts
  const totalWorkouts = recentWorkouts.length;
  
  if (totalWorkouts < 3) {
    return `🏃‍♂️ **Workout Recommendation:**

Great that you're starting your fitness journey! Based on your activity level, I recommend:

• Start with 3-4 workouts per week
• Focus on bodyweight exercises: push-ups, squats, planks
• Include 150 minutes of moderate cardio weekly
• Always warm up and cool down

Would you like me to create a beginner workout plan for you?`;
  } else {
    return `💪 **Workout Analysis:**

You've been quite active! Here's what I recommend:

• Your current frequency looks good
• Consider progressive overload for strength gains
• Mix cardio and strength training
• Don't forget rest days for recovery

Keep up the excellent work! Consistency is key to reaching your fitness goals.`;
  }
}

function generateNutritionAdvice() {
  const todayCalories = calculateTodayCalories();
  const goal = Number(localStorage.getItem('calorieGoal')) || 2000;
  
  return `🥗 **Nutrition Insights:**

Today's Progress: ${todayCalories}/${goal} calories

**Recommendations:**
• Aim for balanced macronutrients (40% carbs, 30% protein, 30% fat)
• Include 5-7 servings of fruits and vegetables daily
• Stay hydrated with 8-10 glasses of water
• Choose whole, unprocessed foods when possible

${todayCalories < goal * 0.8 ? '⚠️ You may need more calories to support your health goals.' : ''}
${todayCalories > goal * 1.2 ? '⚠️ Consider moderating portion sizes to stay within your goals.' : ''}`;
}

function generateWeightAdvice(message) {
  const currentWeight = healthData.weights.length > 0 ? 
    healthData.weights[healthData.weights.length - 1].value : null;
  
  if (!currentWeight) {
    return `📊 **Weight Management:**

To provide personalized advice, I'd recommend tracking your weight regularly. Here are general guidelines:

**For Weight Loss:**
• Create a moderate calorie deficit (300-500 calories)
• Focus on strength training to preserve muscle
• Include cardio for heart health
• Aim for 1-2 lbs per week loss

**For Weight Gain:**
• Increase calories with nutrient-dense foods
• Focus on protein for muscle building
• Include resistance training
• Be patient - healthy weight gain takes time`;
  }
  
  return `📊 **Weight Management Advice:**

Current Weight: ${currentWeight} kg

Based on your goals and current weight, here's my advice:
• Maintain consistent tracking
• Focus on sustainable lifestyle changes
• Combine proper nutrition with regular exercise
• Consider speaking with a nutritionist for personalized meal planning

Remember: Healthy weight changes happen gradually. Focus on overall health, not just the number on the scale!`;
}

function generateSleepAdvice() {
  const recentSleep = healthData.sleep.slice(-7);
  const avgSleep = recentSleep.length > 0 ? 
    recentSleep.reduce((sum, s) => sum + s.hours, 0) / recentSleep.length : 0;
  
  return `😴 **Sleep Optimization:**

${avgSleep > 0 ? `Your average sleep: ${avgSleep.toFixed(1)} hours` : 'Track your sleep for personalized insights'}

**For Better Sleep:**
• Aim for 7-9 hours nightly
• Maintain consistent sleep schedule
• Create a relaxing bedtime routine
• Avoid screens 1 hour before bed
• Keep bedroom cool and dark
• Limit caffeine after 2 PM

${avgSleep < 7 && avgSleep > 0 ? '⚠️ You may benefit from increasing your sleep duration.' : ''}
${avgSleep > 9 ? '💡 Excessive sleep might indicate underlying health issues - consider consulting a doctor.' : ''}`;
}

function generateGeneralHealthAdvice() {
  const healthScore = calculateHealthScore();
  
  return `🌟 **Your Health Overview:**

Health Score: ${healthScore}/100

**Key Recommendations:**
• Stay consistent with tracking your health metrics
• Focus on the fundamentals: nutrition, exercise, sleep, and hydration
• Listen to your body and rest when needed
• Consider regular check-ups with healthcare professionals

**This Week's Focus:**
• Aim for 150 minutes of moderate exercise
• Eat a variety of colorful fruits and vegetables
• Maintain good hydration habits
• Prioritize quality sleep

You're doing great by actively managing your health! Keep up the excellent work! 🎉`;
}

// BMI Calculator
function calculateBMI() {
  const height = parseFloat(document.getElementById('heightInput').value);
  const weight = parseFloat(document.getElementById('weightInputBMI').value);
  
  if (!height || !weight || height <= 0 || weight <= 0) {
    showNotification('Please enter valid height and weight values', 'error');
    return;
  }
  
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  
  let category = '';
  let color = '';
  
  if (bmi < 18.5) {
    category = 'Underweight';
    color = '#ff9500';
  } else if (bmi < 25) {
    category = 'Normal Weight';
    color = '#30d158';
  } else if (bmi < 30) {
    category = 'Overweight';
    color = '#ff9500';
  } else {
    category = 'Obese';
    color = '#ff453a';
  }
  
  document.getElementById('bmiResult').innerHTML = `
    <div class="bmi-value" style="color: ${color}">${bmi.toFixed(1)}</div>
    <div class="bmi-category" style="color: ${color}">${category}</div>
  `;
  
  // Save BMI record
  const bmiRecord = {
    date: new Date().toLocaleDateString(),
    height: height,
    weight: weight,
    bmi: bmi,
    category: category
  };
  
  healthData.bmi.push(bmiRecord);
  save('bmi', healthData.bmi);
  
  showNotification(`BMI calculated: ${bmi.toFixed(1)} (${category})`, 'info');
}

// Sleep Tracking
function logSleep() {
  const hours = parseFloat(document.getElementById('sleepHours').value);
  
  if (!hours || hours <= 0 || hours > 24) {
    showNotification('Please enter valid sleep hours (0-24)', 'error');
    return;
  }
  
  const sleepRecord = {
    date: new Date().toLocaleDateString(),
    hours: hours,
    quality: hours >= 7 ? 'Good' : hours >= 6 ? 'Fair' : 'Poor'
  };
  
  // Remove any existing record for today
  const today = new Date().toLocaleDateString();
  healthData.sleep = healthData.sleep.filter(s => s.date !== today);
  healthData.sleep.push(sleepRecord);
  save('sleep', healthData.sleep);
  
  updateSleepStats();
  document.getElementById('sleepHours').value = '';
  showNotification(`Sleep logged: ${hours} hours`, 'success');
}

function updateSleepStats() {
  const recentSleep = healthData.sleep.slice(-7); // Last 7 days
  
  if (recentSleep.length === 0) {
    document.getElementById('avgSleep').textContent = '0';
    document.getElementById('sleepQuality').textContent = '--';
    return;
  }
  
  const avgHours = recentSleep.reduce((sum, s) => sum + s.hours, 0) / recentSleep.length;
  const latestQuality = recentSleep[recentSleep.length - 1]?.quality || '--';
  
  document.getElementById('avgSleep').textContent = avgHours.toFixed(1);
  document.getElementById('sleepQuality').textContent = latestQuality;
}

// Premium Symptom Checker
function checkSymptoms() {
  if (!isPremiumUser) {
    showPremiumModal();
    return;
  }
  
  const symptoms = document.getElementById('symptomInput').value.trim();
  if (!symptoms) {
    showNotification('Please describe your symptoms', 'error');
    return;
  }
  
  const analysis = analyzeSymptoms(symptoms);
  document.getElementById('symptomResult').innerHTML = `
    <div class="symptom-analysis">
      <h4>🔍 AI Analysis</h4>
      <p>${analysis}</p>
      <small>Generated on ${new Date().toLocaleString()}</small>
    </div>
  `;
  
  // Save symptom record
  const symptomRecord = {
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    symptoms: symptoms,
    analysis: analysis
  };
  
  healthData.symptoms.push(symptomRecord);
  save('symptoms', healthData.symptoms);
  
  document.getElementById('symptomInput').value = '';
  showNotification('Symptom analysis completed', 'info');
}

// Workout Templates
function startWorkout(workoutType) {
  if (workoutType === 'Yoga Flow' && !isPremiumUser) {
    showPremiumModal();
    return;
  }
  
  const workoutData = {
    'Beginner HIIT': { duration: 15, calories: 120 },
    'Strength Training': { duration: 45, calories: 360 },
    'Yoga Flow': { duration: 30, calories: 150 }
  };
  
  const workout = workoutData[workoutType];
  if (workout) {
    // Simulate workout completion
    setTimeout(() => {
      const entry = {
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        type: workoutType,
        duration: workout.duration,
        calories: workout.calories
      };
      
      healthData.workouts.push(entry);
      save('workouts', healthData.workouts);
      renderWorkoutList(healthData.workouts);
      updateHeaderStats();
      
      showNotification(`🎉 Workout completed: ${workoutType}!`, 'success');
    }, 2000);
    
    showNotification(`Starting ${workoutType} workout...`, 'info');
  }
}

// Enhanced Meal Scanner (Premium Feature)
function scanMeal() {
  if (!isPremiumUser) {
    showPremiumModal();
    return;
  }
  
  showNotification('📷 Scanning meal... This would use camera API in production', 'info');
  
  // Simulate meal scanning
  setTimeout(() => {
    const scannedMeals = [
      { name: 'Grilled Chicken Salad', calories: 350, protein: 35, carbs: 15, fat: 18 },
      { name: 'Salmon with Rice', calories: 520, protein: 40, carbs: 45, fat: 22 },
      { name: 'Vegetable Stir Fry', calories: 280, protein: 12, carbs: 35, fat: 14 }
    ];
    
    const meal = scannedMeals[Math.floor(Math.random() * scannedMeals.length)];
    
    const entry = {
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      name: meal.name,
      calories: meal.calories,
      scanned: true
    };
    
    healthData.foods.push(entry);
    save('foods', healthData.foods);
    renderFoodList(healthData.foods);
    updateCalorieStats();
    
    showNotification(`Scanned: ${meal.name} (${meal.calories} kcal)`, 'success');
  }, 3000);
}

// Enhanced Water Tracking
function addWater(amount = 250) {
  healthData.water += amount;
  localStorage.setItem('waterCount', Math.floor(healthData.water / 250)); // Convert to glasses
  updateWaterStats();
  updateWaterVisual();
  showNotification(`Added ${amount}ml of water`, 'success');
}

function addCustomWater() {
  const amount = parseInt(document.getElementById('customWaterAmount').value);
  if (!amount || amount <= 0 || amount > 2000) {
    showNotification('Please enter a valid amount (1-2000ml)', 'error');
    return;
  }
  
  addWater(amount);
  document.getElementById('customWaterAmount').value = '';
}

function updateWaterStats() {
  const totalMl = healthData.water;
  const glasses = Math.floor(totalMl / 250);
  const goalMl = 2000;
  const percentage = Math.min((totalMl / goalMl) * 100, 100);
  
  document.getElementById('waterValue').textContent = glasses;
  document.getElementById('waterMl').textContent = `${totalMl}ml`;
  document.getElementById('waterPercentage').textContent = `${Math.round(percentage)}%`;
}

function updateWaterVisual() {
  const totalMl = healthData.water;
  const percentage = Math.min((totalMl / 2000) * 100, 100);
  const waterLevel = document.getElementById('waterLevel');
  
  if (waterLevel) {
    waterLevel.style.height = `${percentage}%`;
  }
}

// Body Composition Tracking (Premium)
function addBodyComposition() {
  if (!isPremiumUser) {
    showPremiumModal();
    return;
  }
  
  const weight = parseFloat(document.getElementById('weightInput').value);
  const bodyFat = parseFloat(document.getElementById('bodyFatInput').value);
  const muscleMass = parseFloat(document.getElementById('muscleMassInput').value);
  
  if (!weight || weight <= 0) {
    showNotification('Please enter a valid weight', 'error');
    return;
  }
  
  const composition = {
    date: new Date().toLocaleDateString(),
    weight: weight,
    bodyFat: bodyFat || null,
    muscleMass: muscleMass || null
  };
  
  healthData.bodyComposition.push(composition);
  save('bodyComposition', healthData.bodyComposition);
  
  // Also add to regular weight tracking
  addWeight();
  
  showNotification('Body composition recorded', 'success');
  
  // Clear inputs
  document.getElementById('bodyFatInput').value = '';
  document.getElementById('muscleMassInput').value = '';
}

// Premium Report Generation
function generateReport(type) {
  if (!isPremiumUser) {
    showPremiumModal();
    return;
  }
  
  showNotification('🔄 Generating your personalized health report...', 'info');
  
  setTimeout(() => {
    const report = createHealthReport(type);
    downloadReport(report, type);
    showNotification('📊 Health report generated and downloaded!', 'success');
  }, 3000);
}

function createHealthReport(type) {
  const healthScore = calculateHealthScore();
  const workoutCount = healthData.workouts.length;
  const avgCalories = calculateAverageCalories();
  
  return {
    type: type,
    generatedDate: new Date().toISOString(),
    healthScore: healthScore,
    summary: {
      workouts: workoutCount,
      avgCalories: avgCalories,
      waterIntake: healthData.water,
      sleepAverage: calculateAverageSleep()
    },
    recommendations: generatePersonalizedRecommendations()
  };
}

function downloadReport(report, type) {
  const reportText = `
HealthSolve Pro - ${type.toUpperCase()} HEALTH REPORT
Generated: ${new Date(report.generatedDate).toLocaleDateString()}

HEALTH SCORE: ${report.healthScore}/100

SUMMARY:
- Total Workouts: ${report.summary.workouts}
- Average Daily Calories: ${report.summary.avgCalories}
- Water Intake: ${report.summary.waterIntake}ml
- Average Sleep: ${report.summary.sleepAverage} hours

PERSONALIZED RECOMMENDATIONS:
${report.recommendations.join('\n')}

Generated by HealthSolve Pro
  `;
  
  const blob = new Blob([reportText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `health-report-${type}-${new Date().toISOString().split('T')[0]}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// Premium Features
function generateMealPlan() {
  if (!isPremiumUser) {
    showPremiumModal();
    return;
  }
  
  showNotification('👨‍🍳 Creating your personalized meal plan...', 'info');
  // Implementation would integrate with nutrition API
}

function optimizeWorkout() {
  if (!isPremiumUser) {
    showPremiumModal();
    return;
  }
  
  showNotification('💪 Optimizing your workout routine...', 'info');
  // Implementation would analyze workout history and create optimized plan
}

// Health Score Calculation
function calculateHealthScore() {
  let score = 0;
  
  // Workout consistency (25 points)
  const recentWorkouts = healthData.workouts.filter(w => {
    const workoutDate = new Date(w.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return workoutDate >= weekAgo;
  });
  score += Math.min(recentWorkouts.length * 5, 25);
  
  // Nutrition tracking (25 points)
  const todayCalories = calculateTodayCalories();
  const calorieGoal = Number(localStorage.getItem('calorieGoal')) || 2000;
  const calorieRatio = todayCalories / calorieGoal;
  if (calorieRatio >= 0.8 && calorieRatio <= 1.2) {
    score += 25;
  } else if (calorieRatio >= 0.6 && calorieRatio <= 1.4) {
    score += 15;
  } else {
    score += 5;
  }
  
  // Hydration (25 points)
  const waterPercentage = Math.min((healthData.water / 2000) * 100, 100);
  score += (waterPercentage / 100) * 25;
  
  // Sleep (25 points)
  const avgSleep = calculateAverageSleep();
  if (avgSleep >= 7 && avgSleep <= 9) {
    score += 25;
  } else if (avgSleep >= 6 && avgSleep <= 10) {
    score += 15;
  } else {
    score += 5;
  }
  
  return Math.round(score);
}

// Utility Functions
function calculateTodayCalories() {
  const today = new Date().toLocaleDateString();
  return healthData.foods
    .filter(f => f.date === today)
    .reduce((sum, f) => sum + (f.calories || 0), 0);
}

function calculateAverageCalories() {
  if (healthData.foods.length === 0) return 0;
  const totalCalories = healthData.foods.reduce((sum, f) => sum + (f.calories || 0), 0);
  const days = new Set(healthData.foods.map(f => f.date)).size;
  return Math.round(totalCalories / days);
}

function calculateAverageSleep() {
  if (healthData.sleep.length === 0) return 0;
  const totalHours = healthData.sleep.reduce((sum, s) => sum + s.hours, 0);
  return totalHours / healthData.sleep.length;
}

function generatePersonalizedRecommendations() {
  const recommendations = [];
  
  // Workout recommendations
  if (healthData.workouts.length < 3) {
    recommendations.push('• Increase workout frequency to 3-4 times per week for optimal health benefits');
  }
  
  // Nutrition recommendations
  const avgCalories = calculateAverageCalories();
  if (avgCalories < 1500) {
    recommendations.push('• Consider increasing caloric intake with nutrient-dense foods');
  } else if (avgCalories > 2500) {
    recommendations.push('• Monitor portion sizes and focus on balanced meals');
  }
  
  // Hydration recommendations
  if (healthData.water < 1500) {
    recommendations.push('• Increase daily water intake to at least 2L for better hydration');
  }
  
  // Sleep recommendations
  const avgSleep = calculateAverageSleep();
  if (avgSleep < 7) {
    recommendations.push('• Aim for 7-9 hours of sleep per night for optimal recovery');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('• Keep up the excellent work! Your health habits are on track');
  }
  
  return recommendations;
}

// Premium Modal Management
function showPremiumModal() {
  document.getElementById('premiumModal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closePremiumModal() {
  document.getElementById('premiumModal').classList.remove('show');
  document.body.style.overflow = 'auto';
}

function purchasePremium(plan) {
  // In a real app, this would integrate with payment processing
  showNotification('🚀 Redirecting to secure payment...', 'info');
  
  setTimeout(() => {
    // Simulate successful purchase for demo
    isPremiumUser = true;
    localStorage.setItem('premiumUser', 'true');
    closePremiumModal();
    hidePremiumBanner();
    showNotification('🎉 Welcome to Premium! All features unlocked!', 'success');
  }, 2000);
}

function hidePremiumBanner() {
  const banner = document.getElementById('premiumBanner');
  if (banner) {
    banner.style.display = 'none';
  }
}

// Header Stats Update
function updateHeaderStats() {
  const totalWorkouts = healthData.workouts.length;
  const totalCaloriesBurned = healthData.workouts.reduce((sum, w) => sum + (w.calories || 0), 0);
  const healthScore = calculateHealthScore();
  
  document.getElementById('totalWorkouts').textContent = totalWorkouts;
  document.getElementById('totalCalories').textContent = totalCaloriesBurned;
  document.getElementById('healthScore').textContent = healthScore;
}

// Enhanced Notification System
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  notification.style.cssText = `
    position: fixed;
    top: 24px;
    right: 24px;
    padding: 20px 28px;
    border-radius: 16px;
    color: white;
    font-weight: 590;
    font-size: 15px;
    letter-spacing: -0.01em;
    z-index: 1000;
    transform: translateX(400px) scale(0.8);
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.3),
      0 4px 16px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
    max-width: 320px;
    user-select: none;
    -webkit-user-select: none;
  `;
  
  // Enhanced background based on type
  switch(type) {
    case 'success':
      notification.style.background = 'linear-gradient(135deg, rgba(48, 209, 88, 0.95), rgba(52, 199, 89, 0.9))';
      break;
    case 'error':
      notification.style.background = 'linear-gradient(135deg, rgba(255, 69, 58, 0.95), rgba(255, 59, 48, 0.9))';
      break;
    case 'info':
      notification.style.background = 'linear-gradient(135deg, rgba(0, 122, 255, 0.95), rgba(10, 132, 255, 0.9))';
      break;
    default:
      notification.style.background = 'linear-gradient(135deg, rgba(142, 142, 147, 0.95), rgba(152, 152, 157, 0.9))';
  }
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(0) scale(1)';
  }, 100);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(400px) scale(0.8)';
    notification.style.opacity = '0';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 400);
  }, 4000);

  notification.addEventListener('click', () => {
    notification.style.transform = 'translateX(400px) scale(0.8)';
    notification.style.opacity = '0';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 400);
  });
}

// Include all previous functions (addWorkout, renderWorkoutList, addFood, etc.)
// [Previous functions would be included here - keeping existing functionality]

// Subtle 3D Effects (Grounded)
function init3DEffects() {
  const sections = document.querySelectorAll('.section');
  const cards = document.querySelectorAll('.stat-card, .dashboard-card');
  
  // Add subtle hover effects to sections
  sections.forEach(section => {
    section.addEventListener('mouseenter', () => {
      section.style.transform = 'translateZ(4px) translateY(-4px)';
    });
    
    section.addEventListener('mouseleave', () => {
      section.style.transform = 'translateZ(2px)';
    });
  });
  
  // Add subtle effects to cards
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateZ(2px) translateY(-2px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateZ(1px)';
    });
  });
}

// Removed parallax effect for more stable experience

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
  // Initialize data if not exists
  if (!healthData.workouts) healthData.workouts = [];
  if (!healthData.foods) healthData.foods = [];
  if (!healthData.sleep) healthData.sleep = [];
  if (!healthData.symptoms) healthData.symptoms = [];
  if (!healthData.bmi) healthData.bmi = [];
  if (!healthData.bodyComposition) healthData.bodyComposition = [];
  if (!healthData.aiChats) healthData.aiChats = [];
  
  // Hide premium banner if user is premium
  if (isPremiumUser) {
    hidePremiumBanner();
  }
  
  // Load and render all data
  renderWorkoutList(healthData.workouts);
  renderFoodList(healthData.foods);
  updateCalorieStats();
  updateWaterStats();
  updateWaterVisual();
  updateSleepStats();
  updateHeaderStats();
  
  // Initialize weight chart
  if (healthData.weights && healthData.weights.length > 0) {
    initializeChart();
    updateWeightStats();
  } else {
    initializeChart();
  }
  
  // Initialize macro chart
  initializeMacroChart();
  
  // Initialize subtle 3D effects
  setTimeout(() => {
    init3DEffects();
  }, 1000);
  
  // Welcome message for new users
  if (!localStorage.getItem('hasVisited')) {
    setTimeout(() => {
      showNotification('Welcome to HealthSolve Pro! 🎉 Your complete health companion', 'success');
      localStorage.setItem('hasVisited', 'true');
    }, 1000);
  }
  
  // AI input enter key support
  document.getElementById('aiInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendAIMessage();
    }
  });
});

// [Include all existing functions from previous script.js here]
// This includes: addWorkout, renderWorkoutList, addFood, renderFoodList, 
// updateCalorieStats, addWeight, initializeChart, etc.

// Macro Chart for Premium Users
function initializeMacroChart() {
  const ctx = document.getElementById('macroChart');
  if (!ctx) return;
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Protein', 'Carbs', 'Fat'],
      datasets: [{
        data: [25, 50, 25], // Default macro distribution
        backgroundColor: [
          '#ff6b6b',
          '#4ecdc4',
          '#45b7d1'
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#ffffff',
            usePointStyle: true,
            padding: 20
          }
        }
      }
    }
  });
}

// Add all existing functions from the original script.js
// (addWorkout, renderWorkoutList, addFood, renderFoodList, updateCalorieStats, 
//  addWater, resetWater, updateWaterStats, addWeight, initializeChart, etc.)

function addWorkout() {
  const type = document.getElementById("workoutType").value.trim();
  const duration = Number(document.getElementById("workoutDuration").value);
  
  if (!type || !duration || duration <= 0) {
    showNotification('Please enter valid workout details', 'error');
    return;
  }

  const entry = {
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    type: type,
    duration: duration,
    calories: Math.round(duration * 8)
  };
  
  healthData.workouts.push(entry);
  save("workouts", healthData.workouts);
  renderWorkoutList(healthData.workouts);
  updateHeaderStats();
  
  document.getElementById("workoutType").value = "";
  document.getElementById("workoutDuration").value = "";
  
  showNotification(`Workout logged: ${type} for ${duration} minutes`, 'success');
}

function renderWorkoutList(items) {
  const ul = document.getElementById("workoutList");
  ul.innerHTML = "";
  
  items.slice().reverse().slice(0, 10).forEach((item, index) => {
    const li = document.createElement("li");
    li.style.animationDelay = `${index * 0.1}s`;
    
    if (typeof item === 'string') {
      li.textContent = item;
    } else {
      li.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>${item.type}</strong> • ${item.duration} mins
            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">
              ${item.date} at ${item.time} • ~${item.calories} kcal burned
            </div>
          </div>
          <div style="color: var(--accent-orange); font-weight: 600;">${item.duration}m</div>
        </div>
      `;
    }
    ul.appendChild(li);
  });
}

function addFood() {
  const name = document.getElementById("foodName").value.trim();
  const cal = Number(document.getElementById("foodCalories").value);
  
  if (!name || !cal || cal <= 0) {
    showNotification('Please enter valid food details', 'error');
    return;
  }

  const entry = {
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    name: name,
    calories: cal
  };
  
  healthData.foods.push(entry);
  save("foods", healthData.foods);
  renderFoodList(healthData.foods);
  
  document.getElementById("foodName").value = "";
  document.getElementById("foodCalories").value = "";
  
  updateCalorieStats();
  showNotification(`Added: ${name} (${cal} kcal)`, 'success');
}

function renderFoodList(items) {
  const ul = document.getElementById("foodList");
  ul.innerHTML = "";
  
  items.slice().reverse().slice(0, 10).forEach((item, index) => {
    const li = document.createElement("li");
    li.style.animationDelay = `${index * 0.1}s`;
    
    if (typeof item === 'string') {
      li.textContent = item;
    } else {
      li.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>${item.name}</strong>
            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">
              ${item.date} at ${item.time}
            </div>
          </div>
          <div style="color: var(--accent-green); font-weight: 600;">${item.calories} kcal</div>
        </div>
      `;
    }
    ul.appendChild(li);
  });
}

function updateCalorieStats() {
  const today = new Date().toLocaleDateString();
  let total = 0;
  
  healthData.foods.forEach(f => {
    if (typeof f === 'object' && f.date === today) {
      total += f.calories;
    } else if (typeof f === 'string' && f.startsWith(today)) {
      const kcal = Number(f.split(" - ")[2]?.split(" ")[0] || 0);
      total += kcal;
    }
  });
  
  const calorieGoal = Number(localStorage.getItem('calorieGoal')) || 2000;
  const percentage = Math.min((total / calorieGoal) * 100, 100);
  
  document.getElementById("calorieValue").textContent = total;
  document.getElementById("caloriesToday").innerText = `Today's Nutrition: ${total} / ${calorieGoal} kcal`;
  document.getElementById("calorieGoalValue").textContent = calorieGoal;
  document.getElementById("caloriePercentage").textContent = `${Math.round(percentage)}%`;
  
  const fill = document.getElementById("calorieFill");
  fill.style.width = `${percentage}%`;
  
  if (percentage < 50) {
    fill.style.background = 'linear-gradient(90deg, var(--accent-red), #ff6b6b)';
  } else if (percentage < 80) {
    fill.style.background = 'linear-gradient(90deg, var(--accent-orange), #ffb347)';
  } else {
    fill.style.background = 'linear-gradient(90deg, var(--accent-green), #32d74b)';
  }
}

// Include weight tracking functions
let weightData = healthData.weights || [];
let chart = null;

function normalizeWeightData() {
  weightData = weightData.map(item => {
    if (typeof item === 'string') {
      const parts = item.split(' - ');
      if (parts.length >= 2) {
        const date = parts[0];
        const weight = parseFloat(parts[1].replace(' kg', ''));
        return { date, value: weight };
      }
    } else if (typeof item === 'object' && item.date && item.value) {
      return item;
    } else if (typeof item === 'number') {
      return { date: new Date().toLocaleDateString(), value: item };
    }
    return null;
  }).filter(item => item !== null);
  
  weightData.sort((a, b) => new Date(a.date) - new Date(b.date));
  save("weights", weightData);
}

function initializeChart() {
  const canvas = document.getElementById("weightChart");
  if (!canvas) return;
  
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  
  normalizeWeightData();
  
  Chart.defaults.color = '#ffffff';
  Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
  
  if (chart) {
    chart.destroy();
  }
  
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: weightData.map(w => w.date),
      datasets: [{
        label: 'Weight (kg)',
        data: weightData.map(w => w.value),
        borderColor: '#007aff',
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#007aff',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 10,
          right: 10,
          bottom: 10,
          left: 10
        }
      },
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            maxTicksLimit: 8
          }
        },
        y: {
          beginAtZero: false,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            callback: function(value) {
              return value + ' kg';
            }
          }
        }
      }
    }
  });
}

function addWeight() {
  const val = Number(document.getElementById("weightInput").value);
  if (!val || val <= 0 || val > 300) {
    showNotification('Please enter a valid weight (30-300 kg)', 'error');
    return;
  }
  
  const today = new Date().toLocaleDateString();
  const entry = { date: today, value: val };
  
  normalizeWeightData();
  weightData = weightData.filter(w => w.date !== today);
  weightData.push(entry);
  weightData.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  healthData.weights = weightData;
  save("weights", weightData);
  updateChart();
  updateWeightStats();
  
  document.getElementById("weightInput").value = "";
  showNotification(`Weight recorded: ${val} kg`, 'success');
}

function updateChart() {
  if (!chart) {
    initializeChart();
    return;
  }
  
  normalizeWeightData();
  chart.data.labels = weightData.map(w => w.date);
  chart.data.datasets[0].data = weightData.map(w => w.value);
  chart.update('active');
}

function updateWeightStats() {
  normalizeWeightData();
  
  if (weightData.length === 0) {
    document.getElementById("currentWeight").textContent = '--';
    document.getElementById("weightChange").textContent = '--';
    document.getElementById("weightTrend").textContent = '--';
    return;
  }
  
  const current = weightData[weightData.length - 1].value;
  const previous = weightData.length > 1 ? weightData[weightData.length - 2].value : current;
  const change = current - previous;
  
  document.getElementById("currentWeight").textContent = `${current} kg`;
  
  const changeElement = document.getElementById("weightChange");
  if (change > 0) {
    changeElement.textContent = `+${change.toFixed(1)} kg`;
    changeElement.style.color = 'var(--accent-red)';
  } else if (change < 0) {
    changeElement.textContent = `${change.toFixed(1)} kg`;
    changeElement.style.color = 'var(--accent-green)';
  } else {
    changeElement.textContent = '0.0 kg';
    changeElement.style.color = 'var(--text-secondary)';
  }
  
  if (weightData.length >= 3) {
    const recent = weightData.slice(-3);
    const avgChange = (recent[2].value - recent[0].value) / 2;
    const trendElement = document.getElementById("weightTrend");
    
    if (avgChange > 0.1) {
      trendElement.textContent = '📈 Rising';
      trendElement.style.color = 'var(--accent-red)';
    } else if (avgChange < -0.1) {
      trendElement.textContent = '📉 Falling';
      trendElement.style.color = 'var(--accent-green)';
    } else {
      trendElement.textContent = '➡️ Stable';
      trendElement.style.color = 'var(--text-secondary)';
    }
  } else {
    document.getElementById("weightTrend").textContent = '--';
  }
}

function clearWeightData() {
  if (confirm('Are you sure you want to clear all weight data?')) {
    weightData = [];
    healthData.weights = [];
    save("weights", weightData);
    if (chart) {
      chart.destroy();
      chart = null;
    }
    initializeChart();
    updateWeightStats();
    showNotification('Weight history cleared', 'info');
  }
}

// Water functions
function resetWater() {
  healthData.water = 0;
  localStorage.setItem("waterCount", 0);
  updateWaterStats();
  updateWaterVisual();
  showNotification('Daily water count reset', 'info');
}
