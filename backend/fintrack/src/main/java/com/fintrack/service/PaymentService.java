
package com.fintrack.service;

import com.fintrack.entity.Payment;
import com.fintrack.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }

    public Payment createPayment(Payment payment) {
        return paymentRepository.save(payment);
    }

    public Payment updatePayment(Long id, Payment payment) {
        Payment existing = getPaymentById(id);

        existing.setInvoiceNumber(payment.getInvoiceNumber());
        existing.setClientName(payment.getClientName());
        existing.setAmount(payment.getAmount());
        existing.setPaidAmount(payment.getPaidAmount());
        existing.setDate(payment.getDate());
        existing.setDueDate(payment.getDueDate());
        existing.setPaymentMethod(payment.getPaymentMethod());
        existing.setStatus(payment.getStatus());

        return paymentRepository.save(existing);
    }

    public void deletePayment(Long id) {
        paymentRepository.deleteById(id);
    }
}
