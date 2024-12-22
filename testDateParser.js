/**
 * Test file for parseDatePeriod function.
 * This file contains both the function and test cases for Chrome console testing.
 * 
 * How to use:
 * 1. Copy this entire file
 * 2. Open Chrome DevTools (F12)
 * 3. Paste the code
 * 4. Run tests: await runTests()
 */

// Import function if running in module context, otherwise it should be defined in the same file
async function parseDatePeriod(input) {
    if (!input) return { min_days: 0, max_days: 0 };

    try {
        const session = await ai.languageModel.create();
        const prompt = `Convert the following time period to minimum and maximum days.
        OUTPUT in a format (keep all the quotes) {"min_days": "X", "max_days": "Y"}.
        Use these conversion rules:
        - For weeks multiply by 7
        - For months multiply by 30
        - For years multiply by 365
        
        Examples:
        - "2-3 days" -> {"min_days": "2", "max_days": "3"}
        - "1 week" -> {"min_days": "7", "max_days": "7"}
        - "2-3 weeks" -> {"min_days": "14", "max_days": "21"}
        - "1-2 months" -> {"min_days": "30", "max_days": "60"}
        - "around 5 days" -> {"min_days": "4", "max_days": "6"}
        - "2 years" -> {"min_days": "730", "max_days": "730"}
        - "1-2 years" -> {"min_days": "365", "max_days": "730"}
        
        INPUT: ${input}`;

        // Try up to 3 times to get a valid response
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const result = await session.prompt(prompt);
                const parsed = JSON.parse(result);
                
                const min_days = parseInt(parsed.min_days);
                const max_days = parseInt(parsed.max_days);
                
                if (!isNaN(min_days) && !isNaN(max_days)) {
                    return { min_days, max_days };
                }
                
                console.log(`Attempt ${attempt}: Invalid response format, retrying...`);
            } catch (parseError) {
                console.log(`Attempt ${attempt}: Error parsing response, retrying...`);
            }
            
            // Small delay between retries
            if (attempt < 3) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        throw new Error('Failed to get valid response after 3 attempts');
    } catch (error) {
        console.error('Error parsing date period:', error);
        return { min_days: 0, max_days: 0 };
    }
}

// Test cases with expected results
const testCases = [
    // Basic periods
    { input: '2 days', expected: { min_days: 2, max_days: 2 } },
    { input: '1 week', expected: { min_days: 7, max_days: 7 } },
    { input: '1 month', expected: { min_days: 30, max_days: 30 } },
    { input: '1 year', expected: { min_days: 365, max_days: 365 } },
    
    // Ranges
    { input: '2-3 days', expected: { min_days: 2, max_days: 3 } },
    { input: '1-2 weeks', expected: { min_days: 7, max_days: 14 } },
    { input: '2-3 months', expected: { min_days: 60, max_days: 90 } },
    { input: '1-2 years', expected: { min_days: 365, max_days: 730 } },
    
    // Approximate durations
    { input: 'around 5 days', expected: { min_days: 4, max_days: 6 } },
    { input: 'about 2 weeks', expected: { min_days: 12, max_days: 16 } },
    { input: 'approximately 3 months', expected: { min_days: 75, max_days: 105 } },
    
    // Word numbers
    { input: 'two weeks', expected: { min_days: 14, max_days: 14 } },
    { input: 'three months', expected: { min_days: 90, max_days: 90 } },
    { input: 'one year', expected: { min_days: 365, max_days: 365 } },
    
    // Misspellings
    { input: '1 wek', expected: { min_days: 7, max_days: 7 } },
    { input: '2 mounths', expected: { min_days: 60, max_days: 60 } },
    { input: '3 yars', expected: { min_days: 1095, max_days: 1095 } },
    
    // Complex formats
    { input: 'between 2 and 3 weeks', expected: { min_days: 14, max_days: 21 } },
    { input: 'from 1 to 2 months', expected: { min_days: 30, max_days: 60 } },
    { input: 'minimum 3 days', expected: { min_days: 3, max_days: 5 } },
    { input: 'at least 1 week', expected: { min_days: 7, max_days: 10 } },
    { input: 'up to 2 months', expected: { min_days: 30, max_days: 60 } },
    
    // Fractional periods
    { input: '1.5 weeks', expected: { min_days: 10, max_days: 11 } },
    { input: 'two and a half months', expected: { min_days: 75, max_days: 75 } },
    { input: 'half a year', expected: { min_days: 182, max_days: 183 } },
    
    // Multiple units
    { input: '1 month and 2 weeks', expected: { min_days: 44, max_days: 44 } },
    { input: '2 weeks and 3 days', expected: { min_days: 17, max_days: 17 } },
    { input: '1 year and 6 months', expected: { min_days: 545, max_days: 545 } },
    
    // Season-based
    { input: 'summer', expected: { min_days: 90, max_days: 92 } },
    { input: 'winter season', expected: { min_days: 90, max_days: 92 } },
    { input: 'spring break', expected: { min_days: 7, max_days: 14 } },
    
    // Holiday-based
    { input: 'christmas vacation', expected: { min_days: 7, max_days: 14 } },
    { input: 'weekend trip', expected: { min_days: 2, max_days: 3 } },
    { input: 'long weekend', expected: { min_days: 3, max_days: 4 } },
    
    // Edge cases
    { input: '', expected: { min_days: 0, max_days: 0 } },
    { input: 'invalid input', expected: { min_days: 0, max_days: 0 } },
    { input: '0 days', expected: { min_days: 0, max_days: 0 } },
    { input: 'forever', expected: { min_days: 0, max_days: 0 } },
    { input: 'a few days', expected: { min_days: 2, max_days: 4 } }
];

// Helper function to check if results match expected values
function assertResult(actual, expected) {
    return actual.min_days === expected.min_days && actual.max_days === expected.max_days;
}

// Run all test cases
async function runTests() {
    console.log('Running parseDatePeriod tests...\n');
    
    let passed = 0;
    let failed = 0;
    const failures = [];
    
    for (const testCase of testCases) {
        try {
            const result = await parseDatePeriod(testCase.input);
            if (assertResult(result, testCase.expected)) {
                passed++;
            } else {
                failed++;
                failures.push({
                    input: testCase.input,
                    expected: testCase.expected,
                    actual: result
                });
            }
        } catch (error) {
            failed++;
            failures.push({
                input: testCase.input,
                error: error.message
            });
        }
    }
    
    // Print summary
    console.log('\n=== Test Results ===');
    console.log(`Total Tests: ${testCases.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);
    
    // Print failures if any
    if (failures.length > 0) {
        console.log('\n=== Failed Tests ===');
        failures.forEach((failure, index) => {
            console.log(`\n${index + 1}. Input: "${failure.input}"`);
            if (failure.error) {
                console.log(`   Error: ${failure.error}`);
            } else {
                console.log(`   Expected: min_days=${failure.expected.min_days}, max_days=${failure.expected.max_days}`);
                console.log(`   Actual: min_days=${failure.actual.min_days}, max_days=${failure.actual.max_days}`);
            }
        });
    }
}

// Make functions available in global scope for console testing
window.parseDatePeriod = parseDatePeriod;
window.runTests = runTests;

/*
Quick Test Commands (copy/paste into console):

// Run all tests
await runTests()
*/
