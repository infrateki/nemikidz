import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { insertEnrollmentSchema, type InsertEnrollment, type Child, type Program } from "@shared/schema";
import { apiRequest, queryClient } from "../../lib/queryClient";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import * as z from "zod";

// Create a custom form schema that matches the database schema
const formSchema = z.object({
  childId: z.number().min(1, "Child is required"),
  programId: z.number().min(1, "Program is required"),
  enrollmentDate: z.string().min(1, "Enrollment date is required"),
  status: z.enum(["pending", "confirmed", "cancelled"]),
  amount: z.string().min(1, "Amount is required"),
  discount: z.string().optional().default("0"),
  notes: z.string().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewEnrollment() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  // Load children and programs for the selection dropdowns
  const { data: children, isLoading: isLoadingChildren } = useQuery<Child[]>({
    queryKey: ['/api/children'],
  });

  const { data: programs, isLoading: isLoadingPrograms } = useQuery<Program[]>({
    queryKey: ['/api/programs'],
  });

  // Define form with zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      childId: 0,
      programId: 0,
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: "pending",
      amount: "",
      discount: "0",
      notes: null
    }
  });

  // Create mutation for submitting the form
  const createEnrollmentMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("POST", "/api/enrollments", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error creating enrollment");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Enrollment created successfully",
        description: "The enrollment has been added to the system",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/enrollments'] });
      navigate("/enrollments");
    },
    onError: (error) => {
      console.error("Error creating enrollment:", error);
      toast({
        title: "Error creating enrollment",
        description: error.message || "There was an error creating the enrollment",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });

  // Form submission handler
  const onSubmit = (data: FormValues) => {
    setIsSubmitting(true);
    createEnrollmentMutation.mutate(data);
  };

  const isFormReady = !isLoadingChildren && !isLoadingPrograms && 
                      children && children.length > 0 && 
                      programs && programs.length > 0;

  return (
    <AppLayout title="Create New Enrollment">
      <div className="mb-8">
        <p className="text-gray-500">Register a child in a program</p>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Enrollment Details</CardTitle>
          <CardDescription>
            Enter the information for the new enrollment
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="childId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Child</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      defaultValue={field.value ? field.value.toString() : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a child" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingChildren ? (
                          <SelectItem value="loading" disabled>Loading children...</SelectItem>
                        ) : children && children.length > 0 ? (
                          children.map((child) => (
                            <SelectItem key={child.id} value={child.id.toString()}>
                              {child.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>No children available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the child to enroll
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="programId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Program</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      defaultValue={field.value ? field.value.toString() : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a program" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingPrograms ? (
                          <SelectItem value="loading" disabled>Loading programs...</SelectItem>
                        ) : programs && programs.length > 0 ? (
                          programs.map((program) => (
                            <SelectItem key={program.id} value={program.id.toString()}>
                              {program.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>No programs available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the program for enrollment
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enrollmentDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Enrollment Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Select date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => date && field.onChange(date.toISOString().split('T')[0])}
                          disabled={(date) => date > new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The current status of the enrollment
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter the enrollment amount" 
                        {...field} 
                        type="number"
                        step="0.01"
                        min="0"
                      />
                    </FormControl>
                    <FormDescription>
                      The total cost of the enrollment
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter any discount amount" 
                        {...field} 
                        type="number"
                        step="0.01"
                        min="0"
                      />
                    </FormControl>
                    <FormDescription>
                      Any discount applied to this enrollment
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Any additional notes about this enrollment" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => navigate("/enrollments")}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !isFormReady}
              >
                {isSubmitting ? "Creating..." : "Create Enrollment"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </AppLayout>
  );
}