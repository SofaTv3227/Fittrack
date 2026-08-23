import jsPDF from 'jspdf';

export function exportPlanToPdf(plan, profileName = '') {
  const doc = new jsPDF();
  const margin = 14;
  let y = 20;

  doc.setFontSize(18);
  doc.setTextColor(30, 30, 30);
  doc.text(`FitTrack – Trainingsplan: ${plan.name}`, margin, y);
  y += 6;
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(profileName ? `Erstellt für ${profileName}` : '', margin, y);
  y += 10;

  plan.days.forEach((day) => {
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFontSize(13);
    doc.setTextColor(255, 106, 61);
    doc.text(day.name, margin, y);
    y += 7;

    doc.setFontSize(9.5);
    doc.setTextColor(40, 40, 40);
    day.exercises.forEach((ex) => {
      if (y > 275) { doc.addPage(); y = 20; }
      const line = `${ex.name}  —  ${ex.muscle}  |  ${ex.sets} x ${ex.reps}  |  Pause: ${ex.rest}`;
      doc.text(line, margin + 2, y);
      y += 6;
    });
    y += 4;
  });

  doc.save(`FitTrack_Plan_${plan.name.replace(/\s+/g, '_')}.pdf`);
}
