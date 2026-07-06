-- =====================================================
-- Consumer Shopping Behavior Analysis
-- Author: Sujal Kumar
-- Database: consumer_behavior
-- =====================================================

-- 1. Total Revenue Analysis

SELECT SUM(`Purchase Amount (USD)`) AS Total_Revenue
FROM cleaned_customer_shopping_behavior;

-- =====================================================

-- 2. Revenue by Category

SELECT Category,
       SUM(`Purchase Amount (USD)`) AS Revenue
FROM cleaned_customer_shopping_behavior
GROUP BY Category
ORDER BY Revenue DESC;

-- =====================================================

-- 3. Revenue by Gender

SELECT Gender,
       SUM(`Purchase Amount (USD)`) AS Revenue
FROM cleaned_customer_shopping_behavior
GROUP BY Gender;

-- =====================================================

-- 4. Revenue by Season

SELECT Season,
       SUM(`Purchase Amount (USD)`) AS Revenue
FROM cleaned_customer_shopping_behavior
GROUP BY Season
ORDER BY Revenue DESC;

-- =====================================================
-- 5. Revenue by Payment Method
-- =====================================================

SELECT `Payment Method`,
       SUM(`Purchase Amount (USD)`) AS Revenue
FROM cleaned_customer_shopping_behavior
GROUP BY `Payment Method`
ORDER BY Revenue DESC;

-- =====================================================
-- 6. Subscription Analysis
-- =====================================================

SELECT
    `Subscription Status`,
    COUNT(*) AS Customers,
    SUM(`Purchase Amount (USD)`) AS Revenue,
    AVG(`Previous Purchases`) AS Avg_Previous_Purchases
FROM cleaned_customer_shopping_behavior
GROUP BY `Subscription Status`;

-- =====================================================
-- 7. Discount Analysis
-- =====================================================

SELECT
    `Discount Applied`,
    COUNT(*) AS Customers,
    AVG(`Purchase Amount (USD)`) AS Avg_Purchase,
    SUM(`Purchase Amount (USD)`) AS Revenue
FROM cleaned_customer_shopping_behavior
GROUP BY `Discount Applied`;

-- =====================================================
-- 8. Age Group Analysis
-- =====================================================

SELECT
CASE
    WHEN Age BETWEEN 18 AND 25 THEN '18-25'
    WHEN Age BETWEEN 26 AND 35 THEN '26-35'
    WHEN Age BETWEEN 36 AND 45 THEN '36-45'
    WHEN Age BETWEEN 46 AND 55 THEN '46-55'
    WHEN Age BETWEEN 56 AND 65 THEN '56-65'
    ELSE '65+'
END AS Age_Group,

SUM(`Purchase Amount (USD)`) AS Revenue,
AVG(`Purchase Amount (USD)`) AS Avg_Purchase

FROM cleaned_customer_shopping_behavior

GROUP BY Age_Group
ORDER BY Revenue DESC;

-- =====================================================
-- 9. Shipping Type Analysis
-- =====================================================

SELECT
    `Shipping Type`,
    SUM(`Purchase Amount (USD)`) AS Revenue,
    AVG(`Purchase Amount (USD)`) AS Avg_Purchase
FROM cleaned_customer_shopping_behavior
GROUP BY `Shipping Type`
ORDER BY Revenue DESC;