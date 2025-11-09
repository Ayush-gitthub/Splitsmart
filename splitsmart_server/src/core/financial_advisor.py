import openai
from src.core.config import settings
from typing import List, Dict
import json
client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
from src.schemas.expense import Expense
from src.schemas.balance import UserBalance
# --- Group Level Analysis ---

GROUP_ADVISOR_PROMPT = """
You are a friendly and insightful financial advisor for a group of friends. Your task is to analyze their shared spending data and provide a concise, helpful summary.

Based on the JSON data provided below, which includes a list of expenses and the final balances for each member, please generate a report covering these key points:
1.  **Spending Overview:** Briefly summarize the group's total spending and the main categories they spent on.
2.  **Top Spender Analysis:** Identify the person who paid for the most expenses (the "Group Banker") and acknowledge their contribution.
3.  **Key Spending Insights:** Highlight the largest expense or the most frequent spending category.
4.  **Actionable Advice:** Offer one or two simple, friendly suggestions for how the group could manage their expenses more effectively or save money. For example, suggest alternatives if they are spending a lot on a specific category.
5.  **Debt Summary:** Briefly mention who owes the most and who is owed the most to encourage settlement.

Keep the tone positive and collaborative, not accusatory. Format the output as a clean, human-readable string.
"""

# --- THIS IS THE CORRECTED FUNCTION ---
async def get_group_financial_advice(expenses: List[Expense], balances: List[UserBalance]) -> str:
    """
    Takes group expense and balance Pydantic models, gets financial advice from GPT-4o.
    """
    # Create the dictionary that will be serialized
    prompt_data = {
        # Use a list comprehension and .model_dump() to convert Pydantic models to dicts
        "group_expenses": [exp.model_dump() for exp in expenses],
        "member_balances": [bal.model_dump() for bal in balances]
    }
    
    # Use Pydantic's built-in JSON serialization which correctly handles datetimes/enums
    prompt_json = json.dumps(prompt_data, default=str) # Using default=str is a robust way to handle any non-serializable types

    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": GROUP_ADVISOR_PROMPT},
            {"role": "user", "content": f"Here is the group's financial data:\n\n{prompt_json}"}
        ],
        temperature=0.6,
        max_tokens=500
    )
    print(response)
    return response.choices[0].message.content

# --- User Level Analysis ---

USER_ADVISOR_PROMPT = """
You are a personal financial advisor. Your task is to analyze an individual's spending data across all their shared groups and provide a private, helpful summary.

Based on the JSON data provided below, which includes a summary of the user's spending in different categories and their net balance, please generate a report covering these key points:
1.  **Overall Financial Position:** Start by stating the user's total net balance (whether they are owed money or owe money overall).
2.  **Top Spending Categories:** Identify the top 2-3 categories where the user's share of spending is highest.
3.  **Spending Habit Insights:** Briefly analyze their spending. For example, "A significant portion of your shared spending goes towards dining out."
4.  **Personalized Tip:** Offer one actionable, personalized tip for managing their shared expenses better. For example, if they spend a lot on transport, suggest carpooling.

Keep the tone encouraging and private. Format the output as a clean, human-readable string.
"""

async def get_user_financial_advice(user_spending_summary: Dict) -> str:
    """
    Takes a user's spending summary and gets personalized financial advice from GPT-4o.
    """
    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": USER_ADVISOR_PROMPT},
            {"role": "user", "content": f"Here is my personal spending data:\n\n{json.dumps(user_spending_summary, indent=2)}"}
        ],
        temperature=0.6,
        max_tokens=500
    )
    print(response)
    return response.choices[0].message.content