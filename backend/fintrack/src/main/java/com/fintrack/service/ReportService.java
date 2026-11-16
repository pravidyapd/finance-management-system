package com.fintrack.service;

import com.fintrack.entity.Report;
import com.fintrack.repository.ReportRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReportService {

    private final ReportRepository reportRepository;

    public ReportService(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    public Report getReportById(Long id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));
    }

    public Report createReport(Report report) {
        return reportRepository.save(report);
    }

    public Report updateReport(Long id, Report report) {
        Report existing = getReportById(id);

        existing.setTitle(report.getTitle());
        existing.setReportType(report.getReportType());
        existing.setStartDate(report.getStartDate());
        existing.setEndDate(report.getEndDate());
        existing.setTotalIncome(report.getTotalIncome());
        existing.setTotalExpenses(report.getTotalExpenses());
        existing.setNetProfit(report.getNetProfit());

        return reportRepository.save(existing);
    }

    public void deleteReport(Long id) {
        Report report = getReportById(id);
        reportRepository.delete(report);
    }
}