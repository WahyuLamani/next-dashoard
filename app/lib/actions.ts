'use server';
import { z } from "zod";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const FormSchema = z.object({
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
})
const RawData = FormSchema.omit({ date: true ,id: true});
export async function createInvoice(formData: FormData) {
    const {customerId,amount,status} = RawData.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status')
    })
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    try {
        await sql`INSERT INTO invoices (customer_id, amount, status, date) VALUES (${customerId}, ${amountInCents}, ${status}, ${date})`;
    } catch (error) {
        console.log(error);
    }
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}
export async function updateInvoice(id:string,formData: FormData) {
    const {customerId,amount,status} =  RawData.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status')
    })    

    console.log(status);
    
    const amountInCents = amount * 100;
    const response = await sql`
                    UPDATE invoices
                    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
                    WHERE id = ${id}
                    `;
    console.log(response);
    
    
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}
export async function deleteInvoice(id: string) {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices'); 
}
export async function getInvoice(id: string) {}